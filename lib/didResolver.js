/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import {didIo, isDidUrl, parseDid} from '@bedrock/did-io';
import {
  validateDidRequest,
  validateRequestOptions
} from './validators/index.js';
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
  let _isDidUrl = false;
  let error;
  try {
    _isDidUrl = isDidUrl({did});
    const {method} = parseDid({did});
    await validateDidRequest({method, supportedMethods, didOptions});
    const didDocument = await didIo.get({did});
    // FIXME didOptions should probably be in didIo
    // in the future
    validateRequestOptions({
      did,
      didDocument,
      didOptions,
      publicKeyFormats
    });
    return {
      statusCode: 200,
      resolutionResult: new DidResolutionResult({
        didDocument,
        isDidUrl: _isDidUrl
      })
    };
  } catch(e) {
    logger.error(`did resolution error: ${did}`, {error: e});
    error = e;
  }
  if(error) {
    return {
      statusCode: error.statusCode || 500,
      resolutionResult: new DidResolutionResult({error, isDidUrl: _isDidUrl})
    };
  }
};
