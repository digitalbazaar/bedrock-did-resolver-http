/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */

import {DidResolverError} from '@digitalbazaar/did-io';

/**
 * Validates the components of a did.
 *
 * @param {object} options - Options to use.
 * @param {string} options.method - The did method of the did
 *   being resolved.
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
  method,
  supportedMethods,
}) => {
  // this is for conformance with the did resolver spec
  if(!supportedMethods.includes(method)) {
    throw new DidResolverError({
      message: `Unsupported method ${method}`,
      code: 'methodNotSupported'
    });
  }
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
    throw new DidResolverError({
      message: `Unsupported public key type ${publicKeyFormat}`,
      code: 'unsupportedPublicKeyType'
    });
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
        throw new DidResolverError({
          message: `Invalid Public Key Type ${publicKeyFormat}`,
          code: 'invalidPublicKeyType'
        });
      }
      // no further checks needed
      return;
    }
    const signatureFormats = [
      ...verificationFormats,
      'Ed25519VerificationKey2020'
    ];
    if(!signatureFormats.includes(publicKeyFormat)) {
      throw new DidResolverError({
        message: `Invalid Public Key Type ${publicKeyFormat}`,
        code: 'invalidPublicKeyType'
      });
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
