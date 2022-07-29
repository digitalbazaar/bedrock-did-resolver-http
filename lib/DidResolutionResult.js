/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */

export class DidResolutionResult {
  constructor({
    isDidUrl,
    didDocument = {},
    didDocumentMetadata = null,
    error
  }) {
    this['@context'] = 'https://w3id.org/did-resolution/v1';
    this.didDocument = didDocument;
    this.didDocumentMetadata = didDocumentMetadata;
    const metadataProperty = isDidUrl ?
      'didDereferencingMetadata' : 'didResolutionMetadata';
    this[metadataProperty] = {};
    // only define error if it was passed in
    if(error) {
      this[metadataProperty].error = error.code || 'internalError';
    }
  }
}
