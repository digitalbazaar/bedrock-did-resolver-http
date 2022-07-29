/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import {didIo} from 'bedrock-did-io';
import {getDidComponents} from './didComponents.js';
import {DidResolutionResult} from './ResolutionResult';

/**
 * Resolves a did after validating it.
 *
 * @param {object} options - Options to use.
 * @param {string} options.did - The did or didUrl being resolved.
 * @param {Array<string>} options.supportedMethods - A list of
 *   did methods this resolver supports.
 * @param {object} options.didOptions - Options passed to the resolver.
 *
 * @returns {number, object} - Returns a status code and the resolution data.
 */
export const resolveDid = async ({did, supportedMethods, didOptions}) => {
  const didComponents = getDidComponents({did});
  const {isDidUrl} = didComponents;
  let error;
  try {

  } catch(e) {
    error = e;
  }
  if(error) {
    return {
      statusCode: error.statusCode || 500,
      resolutionResult: new DidResolutionResult({error, isDidUrl})
    };
  }
  const didDocument = await didIo.get({did});
  return {
    statusCode: 200,
    resolutionResult: new DidResolutionResult({didDocument, isDidUrl})
  };
};
