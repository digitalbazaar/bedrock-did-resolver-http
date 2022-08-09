/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import {didIo} from '@bedrock/did-io';
import {DidResolutionResult} from './DidResolutionResult.js';
import logger from './logger.js';
import {parseDid} from '@digitalbazaar/did-io';
import {validateDidRequest} from './validators.js';

/**
 * Resolves a did after validating it.
 *
 * @param {object} options - Options to use.
 * @param {string} options.did - The did or didUrl being resolved.
 * @param {Array<string>} options.supportedMethods - A list of
 *   did methods this resolver supports.
 * @param {object} options.didOptions - Options passed to the resolver.
 * @param {object} options.resolverOptions - Options for the resolver.
 *
 * @returns {object} - Returns a status code and the resolution data.
 */
export const resolveDid = async ({
  did,
  supportedMethods,
  didOptions: rawOptions,
  resolverOptions
}) => {
  let error;
  let didDocument;
  try {
    const {method} = parseDid({did});
    const didOptions = _convertDidOptions({didOptions: rawOptions});
    await validateDidRequest({method, supportedMethods, didOptions});
    didDocument = await didIo.get({did, options: didOptions});
  } catch(e) {
    logger.error(`did resolution error: ${did}`, {error: e});
    error = e;
  }
  return _formatResponse({resolverOptions, didDocument, error, did});
};

/**
 * Did Resolvers can return the didDocument itself or wrapped with metadata.
 *
 * @private
 *
 * @param {object} options - Options to use.
 * @param {object} options.resolverOptions - Options for the did resolver
 *   usually found in headers.
 * @param {object} options.didDocument - A didDocument.
 * @param {Error} [options.error] - An error.
 * @param {string} options.did - The did being resolved or derefernced.
 *
 * @returns {{statusCode: number, resolutionResult: object}} - What to return
 *   as the response.
 */
function _formatResponse({resolverOptions, didDocument, error, did}) {
  const {accept = ''} = resolverOptions;
  const didResolutionContext = 'https://w3id.org/did-resolution';
  const addMetadata = accept.includes(didResolutionContext);
  if(!addMetadata) {
    if(error) {
      throw error;
    }
    return {
      // FIXME services are not handled here yet
      statusCode: 200,
      resolutionResult: didDocument
    };
  }
  return {
    //FIXME services should return 303
    statusCode: error ? _errorCodeToStatusCode({code: error.code}) : 200,
    resolutionResult: new DidResolutionResult({did, didDocument, error})
  };
}

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

// takes in search params / url queries
// and then converts properties that should be booleans
// to booleans
function _convertDidOptions({didOptions}) {
  if(!didOptions) {
    return;
  }
  if(didOptions.enableExperimentalPublicKeyTypes) {
    didOptions.enableExperimentalPublicKeyTypes = _convertSearchParamToBoolean({
      param: didOptions.enableExperimentalPublicKeyTypes
    });
  }
  return didOptions;
}

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
  // the param must start & end with one of these values ignoring case
  const booleanParam = /^((?<false>0|false)|(?<true>1|true))$/i;
  const {groups} = booleanParam.exec(param.trim()) || {};
  if(!groups) {
    throw new Error(
      `Expected search param to be 0, "false", 1, or "true" received ${param}`);
  }
  // if we captured a false value return false
  if(groups.false !== undefined) {
    return false;
  }
  return true;
}
