/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import {isDidUrl} from '@digitalbazaar/did-io';

/**
 * Creates the JSON-LD for the response.
 *
 * @param {object} options - Options to use.
 * @param {string} [options.did=''] - The did being resolved.
 * @param {object} [options.didDocument={}] - The didDocument for the
 *   response.
 * @param {object|null} [options.didDocumentMetadata=null] - Meta data
 *   for the didDocument.
 * @param {Error} options.error - An error if any was raised.
 */
export class DidResolutionResult {
  constructor({
    did = '',
    didDocument = {},
    didDocumentMetadata = null,
    error
  }) {
    this['@context'] = 'https://w3id.org/did-resolution/v1';
    this.didDocument = didDocument;
    this.didDocumentMetadata = didDocumentMetadata;
    const hasDereferencingMetadata = isDidUrl({did});
    const metadataProperty = hasDereferencingMetadata ?
      'didDereferencingMetadata' : 'didResolutionMetadata';
    this[metadataProperty] = {};
    // only define error if it was passed in
    if(error) {
      this[metadataProperty].error = error.code || 'internalError';
    }
  }
}
