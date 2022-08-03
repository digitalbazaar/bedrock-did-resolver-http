/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */

import * as didErrors from './didErrors.js';
import * as didKeyErrors from './didKeyErrors.js';
import * as didResolverErrors from './didResolverErrors.js';
import {IdDecoder} from 'bnid';

const idDecoder = new IdDecoder();
// multicodec ed25519-pub header as Uint8Array
const MULTICODEC_ED25519_PUB_HEADER = new Uint8Array([0xed, 0x01]);

/**
 * Validates the components of a did.
 *
 * @param {object} options - Options to use.
 * @param {object} options.didKeyComponents - An object with
 *   various did components.
 * @param {Array<string>} options.supportedMethods - A list of
 *   did:key methods this implementation supports.
 *
 * @throws {Error} Throws did related errors.
 *
 * @returns {boolean} - Are the did components valid?
 */
// fixme this should probably be moved into the did-method-key
// get function and be run before returning a didDocument
export const validateDidRequest = ({
  didKeyComponents,
  supportedMethods,
}) => {
  const {scheme, method, version, multibase, did, isDidUrl} = didKeyComponents;
  // this is for conformance with the did resolver spec
  if(!supportedMethods.includes(method)) {
    throw new didResolverErrors.MethodNotSupported(
      `Unsupported method ${method}`);
  }
  _validateDid({scheme, did, isDidUrl});
  if((isDidUrl && !_isValidDidUrl({didUrl: did}))) {
    throw new didErrors.InvalidDidUrl(`Invalid didUrl ${did}`);
  }
  _validateDidKey({method, version, multibase});
  _validateMultibaseEd25519({didKeyComponents});
};

// FIXME while we do validate public key formats we do not
// convert to the requested public key format.
/**
 * Public did:keys can be represented in multiple formats.
 * While we don't do any conversion in this library we still make
 * the check.
 *
 * @param {object} options - Options to use.
 * @param {Array<string>} options.publicKeyFormats - A list of
 *   public key formats our did:key implementation supports.
 * @param {object} options.didOptions - The didOptions from searchParams
 *   and headers.
 * @param {string} options.didOptions.publicKeyFormat - The format
 *   the public key should be returned in.
 * @param {string} options.didOptions.enableExperimentalPublicKeyTypes - An
 *   option that can be passed in to allow experimental key types.
 * @param {object} options.didDocument - The didDocument requred by the did
 *   or didUrl.
 *
 * @throws {Error} Throws UnsupportedPublicKeyType or InvalidPublicKeyType.
 *
 * @returns {undefined} Returns on sucess.
 */
export const validateRequestOptions = ({
  publicKeyFormats = [],
  didOptions: {
    publicKeyFormat,
    enableExperimentalPublicKeyTypes = false
  } = {},
  didDocument,
}) => {
  // if no publicKeyFormat was in the request just skip this check
  if(!publicKeyFormat) {
    return;
  }
  // supported public key formats are set manually on config
  if(!publicKeyFormats.includes(publicKeyFormat)) {
    throw new didKeyErrors.UnsupportedPublicKeyType(
      `Unsupported public key type ${publicKeyFormat}`);
  }
  // all of the other did methods so far are signature verification
  if(!_convertSearchParamToBoolean({param: enableExperimentalPublicKeyTypes})) {
    const verificationFormats = ['Multikey', 'JsonWebKey2020'];
    //keyAgreement is an encryption verification method
    if(didDocument.type === 'X25519KeyAgreementKey2020') {
      const encryptionFormats = [
        ...verificationFormats,
        'X25519KeyAgreementKey2020'
      ];
      if(!encryptionFormats.includes(publicKeyFormat)) {
        throw new didKeyErrors.InvalidPublicKeyType(
          `Invalid Public Key Type ${publicKeyFormat}`);
      }
      // no further checks needed
      return;
    }
    const signatureFormats = [
      ...verificationFormats,
      'Ed25519VerificationKey2020'
    ];
    if(!signatureFormats.includes(publicKeyFormat)) {
      throw new didKeyErrors.InvalidPublicKeyType(
        `Invalid Public Key Type ${publicKeyFormat}`);
    }
  }
};

/**
 * Search Params are encoded as strings so this turns
 * strings of value '0' or 'false' into false.
 *
 * @param {object} options - Options to use.
 * @param {string} options.param - The param value.
 *
 * @returns {boolean} Returns a boolean.
 */
function _convertSearchParamToBoolean({param}) {
  if(typeof param !== 'string') {
    return Boolean(param);
  }
  const falsey = /0|false/i;
  if(falsey.test(param)) {
    return false;
  }
  return true;
}

/**
 * General validation for did:keys independent
 * of key type specific validation.
 *
 * @param {object} options - Options to use.
 * @param {string} options.method - A did:method.
 * @param {string|number} options.version - A did:method:version.
 * @param {string} [options.multibase = ''] - The multibase value
 *   of the did:key.
 *
 * @throws {Error} Throws general did:key errors.
 *
 * @returns {undefined} If the didKeyComponents are valid.
 */
function _validateDidKey({
  method,
  version,
  multibase = '',
}) {
  if(method !== 'key') {
    throw new didErrors.InvalidDid(`Method must be "key" received "${method}"`);
  }
  if(!multibase.startsWith('z')) {
    throw new didErrors.InvalidDid(
      `Multibase must start with "z" received ${multibase[0]}`);
  }
  _validateVersion({version});
}

function _validateDid({scheme, did, isDidUrl}) {
  // this is more specific than just invalidDid
  if(scheme !== 'did') {
    throw new didErrors.InvalidDid(`Scheme must be "did" received "${scheme}"`);
  }
  // this will catch invalid dids such as did:key:@@
  if(!isDidUrl && !_isValidDid({did})) {
    throw new didErrors.InvalidDid(`Invalid did ${did}`);
  }
}

/**
 * A version must be convertible to a positive integer.
 *
 * @param {object} options - Options to use.
 * @param {string|number} options.version - A did:key:version.
 *
 * @throws {Error} Throws InvalidDid.
 *
 * @returns {undefined} Returns on success.
 */
function _validateVersion({version}) {
  try {
    const versionNumber = Number.parseInt(version);
    if(versionNumber <= 0) {
      throw new didErrors.InvalidDid(
        `Version must be a positive integer received "${versionNumber}"`);
    }
  } catch(e) {
    throw new didErrors.InvalidDid(
      `Version must be a number received "${version}"`);
  }
}

// FIXME we should probably refactor
// ed25519-verification-key-2020/lib/Ed25519VerificationKey2020.js
// to use these newer errors the check is already there
function _validateMultibaseEd25519({didKeyComponents}) {
  const {multibase} = didKeyComponents;
  const publicKeyBytes = idDecoder.decode(multibase).
    slice(MULTICODEC_ED25519_PUB_HEADER.length);
  if(publicKeyBytes.length !== 32) {
    throw new didKeyErrors.InvalidPublicKeyLength(
      'Expected 32 byte public key.');
  }
}

/**
 * This function comes from the did-test-suite.
 *
 * @see https://github.com/w3c/did-test-suite/
 *
 * @param {object} options - Options to use.
 * @param {string} options.did - A prospective did.
 *
 * @returns {boolean} - Returns true or false.
*/
function _isValidDid({did}) {
  const didRegex1 = new RegExp('^did:(?<method_name>[a-z0-9]+):' +
  '(?<method_specific_id>([a-zA-Z0-9\\.\\-_]|%[0-9a-fA-F]{2}|:)+$)');
  const didRegex2 = /:$/;
  return didRegex1.test(did) && !didRegex2.test(did);
}

/**
 * This function comes from the did-test-suite.
 *
 * @see https://github.com/w3c/did-test-suite/
 *
 * @param {object} options - Options to use.
 * @param {string} options.didUrl - A prospective didUrl.
 *
 * @returns {boolean} - Returns true or false.
*/
function _isValidDidUrl({didUrl}) {
  const pchar = '[a-zA-Z0-9\\-\\._~]|%[0-9a-fA-F]{2}|[!$&\'()*+,;=:@]';
  const didUrlPattern =
      '^' +
      'did:' +
      '([a-z0-9]+)' + // method_name
      '(:' + // method-specific-id
          '([a-zA-Z0-9\\.\\-_]|%[0-9a-fA-F]{2})+' +
      ')+' +
      '((/(' + pchar + ')+)+)?' + // path-abempty
      '(\\?(' + pchar + '|/|\\?)+)?' + // [ "?" query ]
      '(#(' + pchar + '|/|\\?)+)?' + // [ "#" fragment ]
      '$'
      ;
  return new RegExp(didUrlPattern).test(didUrl);
}
