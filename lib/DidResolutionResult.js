/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */

/**
 * Creates the JSON-LD for the response.
 *
 * @param {object} options - Options to use.
 * @param {boolean} [options.hasDereferencingMetadata=false] - Does the
 *   response need didDereferencingMetadata?
 * @param {object} [options.didDocument={}] - The didDocument for the
 *   response.
 * @param {object|null} [options.didDocumentMetadata=null] - Meta data
 *   for the didDocument.
 * @param {Error} options.error - An error if any was raised.
 */
export class DidResolutionResult {
  constructor({
    hasDereferencingMetadata = false,
    didDocument = {},
    didDocumentMetadata = null,
    error
  }) {
    this['@context'] = 'https://w3id.org/did-resolution/v1';
    this.didDocument = didDocument;
    this.didDocumentMetadata = didDocumentMetadata;
    const metadataProperty = hasDereferencingMetadata ?
      'didDereferencingMetadata' : 'didResolutionMetadata';
    this[metadataProperty] = {};
    // only define error if it was passed in
    if(error) {
      this[metadataProperty].error = error.code || 'internalError';
    }
  }
}
