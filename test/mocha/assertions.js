/*
 * Copyright (c) 2021-2022 Digital Bazaar, Inc. All rights reserved.
 */

/**
 * Tests the properties of a did resolver return value.
 *
 * @param {object} data - The data from a did resolver.
 *
 * @returns {undefined} Just returns on success.
 */
export const shouldBeDidResolverResponse = data => {
  const resolverResponse = 'DID Resolver response';
  should.exist(data, `Expected ${resolverResponse} to have data.`);
  data.should.be.an(
    'object',
    `Expected ${resolverResponse} data to be an object`
  );
  data.should.have.property('didDocument');
  data.should.have.property('@context');
  data.should.have.property('didDocumentMetadata');
  const didMetaData = data.didDereferencingMetadata ||
    data.didResolutionMetadata;
  should.exist(didMetaData, 'Expected didResolver data to have either' +
    ' "didDereferencingMetadata" or "didResolutionMetadata"');
};

