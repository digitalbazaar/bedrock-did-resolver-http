/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import {isDidUrl, parseDid} from '@digitalbazaar/did-io';
import {
  validateDidRequest,
  validateRequestOptions
} from './validators.js';
import {didIo} from '@bedrock/did-io';
import {DidResolutionResult} from './DidResolutionResult.js';
import logger from './logger.js';

/**
 * Resolves a did after validating it.
 *
 * @param {object} options - Options to use.
 * @param {string} options.did - The did or didUrl being resolved.
 * @param {Array<string>} options.supportedMethods - A list of
 *   did methods this resolver supports.
 * @param {Array<string>} options.publicKeyFormats - A list of
 *   public key formats this resolver supports.
 * @param {object} options.didOptions - Options passed to the resolver.
 *
 * @returns {object} - Returns a status code and the resolution data.
 */
export const resolveDid = async ({
  did,
  supportedMethods,
  publicKeyFormats,
  didOptions
}) => {
  let hasDereferencingMetadata = false;
  let error;
  try {
    hasDereferencingMetadata = isDidUrl({did});
    const {method} = parseDid({did});
    await validateDidRequest({method, supportedMethods, didOptions});
    const didDocument = await didIo.get({did});
    // FIXME didOptions should probably be in didIo
    // in the future
    validateRequestOptions({
      didDocument,
      didOptions,
      publicKeyFormats
    });
    return {
      statusCode: 200,
      resolutionResult: new DidResolutionResult({
        didDocument,
        hasDereferencingMetadata
      })
    };
  } catch(e) {
    logger.error(`did resolution error: ${did}`, {error: e});
    error = e;
  }
  if(error) {
    return {
      statusCode: _errorCodeToStatusCode({code: error.code}),
      resolutionResult: new DidResolutionResult({
        error,
        hasDereferencingMetadata
      })
    };
  }
};

/**
 * Matches an error.code to a status code or 500.
 *
 * @see https://w3c-ccg.github.io/did-resolution/
 * @private
 *
 * @param {object} options - Options to use.
 * @param {string} options.code - An error.
 *
 * @returns {number} - An http status code.
 */
function _errorCodeToStatusCode({code}) {
  const statuses = [
    {statusCode: 404, codes: ['notFound']},
    {
      statusCode: 400,
      // FIXME these codes should have more specific statusCodes soon
      codes: [
        'invalidDid',
        'invalidDidUrl',
        'unsupportedPublicKeyType',
        // method not supported discussion is here:
        // @see https://github.com/w3c-ccg/did-resolution/issues/72
        'methodNotSupported',
        'invalidPublicKeyType',
        'invalidPublicKey',
        'invalidPublicKeyLength'
      ]
    },
    {statusCode: 406, codes: ['representationNotSupported']},
    {statusCode: 500, codes: ['internalError']},
    // if the did has been deactivated return 410
    {statusCode: 410, codes: ['deactivated']},
    // if the did resolves to a service return 303
    {statusCode: 303, codes: ['service']}
  ];
  const {statusCode = 500} = statuses.find(
    ({codes}) => codes.includes(code)) || {};
  return statusCode;
}
