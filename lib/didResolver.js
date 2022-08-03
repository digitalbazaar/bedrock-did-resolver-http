/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import {didIo} from '@bedrock/did-io';
import {DidResolutionResult} from './DidResolutionResult.js';
import {getDidKeyComponents} from './didComponents.js';
import logger from './logger.js';
import {validateDidRequest} from './validators/index.js';

/**
 * Resolves a did after validating it.
 *
 * @param {object} options - Options to use.
 * @param {string} options.did - The did or didUrl being resolved.
 * @param {Array<string>} options.supportedMethods - A list of
 *   did methods this resolver supports.
 * @param {object} options.didOptions - Options passed to the resolver.
 *
 * @returns {object} - Returns a status code and the resolution data.
 */
export const resolveDid = async ({did, supportedMethods, didOptions}) => {
  let isDidUrl = false;
  let error;
  try {
    const didKeyComponents = getDidKeyComponents({did});
    isDidUrl = didKeyComponents.isDidUrl;
    await validateDidRequest({didKeyComponents, supportedMethods, didOptions});
    const didDocument = await didIo.get({did});
    return {
      statusCode: 200,
      resolutionResult: new DidResolutionResult({didDocument, isDidUrl})
    };
  } catch(e) {
    logger.error(`did resolution error: ${did}`, {error: e});
    error = e;
  }
  if(error) {
    return {
      statusCode: error.statusCode || 500,
      resolutionResult: new DidResolutionResult({error, isDidUrl})
    };
  }
};
