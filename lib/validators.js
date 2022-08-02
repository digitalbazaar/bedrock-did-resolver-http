/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */

import * as didErrors from './didErrors.js';
import * as didKeyErrors from './didKeyErrors.js';
import {IdDecoder} from 'bnid';

const idDecoder = new IdDecoder();
// multicodec ed25519-pub header as varint
const MULTICODEC_ED25519_PUB_HEADER = new Uint8Array([0xed, 0x01]);

/**
 * Validates the components of a did.
 *
 * @param {object} options - Options to use.
 * @param {object} options.didKeyComponents - An object with
 *   various did components.
 *
 * @throws {Error} Throws did related errors.
 *
 * @returns {boolean} - Are the did components valid?
 */
// fixme this should probably be moved into the did-method-key
// get function and be run before returning a didDocument
export const validateDidKey = ({didKeyComponents}) => {
  const didKeyCompliant = _validateDidKey({didKeyComponents});
  const ed25519Compliant = _validateMultibaseEd25519({didKeyComponents});
  return didKeyCompliant && ed25519Compliant;
};

/**
 * General validation for did:keys independent
 * of key type specific validation.
 *
 * @param {object} options - Options to use.
 * @param {object} options.didKeyComponents - An object with
 *   did components such as schema and method.
 *
 * @throws {Error} Throws general did:key errors.
 *
 * @returns {boolean} If the didKeyComponents are valid.
 */
function _validateDidKey({didKeyComponents}) {
  const {scheme, method, version, multibase = '', did} = didKeyComponents;
  if(scheme !== 'did') {
    throw new didErrors.InvalidDid(`Scheme must be "did" received "${scheme}"`);
  }
  if(method !== 'key') {
    throw new didErrors.InvalidDid(`Method must be "key" received "${method}"`);
  }
  const invalidDidUrl = (didKeyComponents.isDidUrl &&
    !_isValidDidUrl({didUrl: did}));
  if(invalidDidUrl) {
    throw new didErrors.InvalidDidUrl(`Invalid didUrl ${did}`);
  }
  if(!multibase.startsWith('z')) {
    throw new didErrors.InvalidDid(
      `Multibase must start with "z" received ${multibase[0]}`);
  }
  return _validateVersion({version});
}

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
  return true;
}

// FIXME we should probably refactor
// ed25519-verification-key-2020/lib/Ed25519VerificationKey2020.js
// to use these newer errors
function _validateMultibaseEd25519({didKeyComponents}) {
  const {multibase} = didKeyComponents;
  const publicKeyBytes = idDecoder.decode(multibase).
    slice(MULTICODEC_ED25519_PUB_HEADER.length);
  if(publicKeyBytes.length !== 32) {
    throw new didKeyErrors.InvalidPublicKeyLength(
      'Expected 32 byte publicKey.');
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
