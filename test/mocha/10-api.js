/*
 * Copyright (c) 2021-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {makeRequest} from './helpers.js';
import {shouldBeDidResolverResponse} from './assertions.js';

// default valid bs58 ed25519 did
const did = 'did:key:z6MktKwz7Ge1Yxzr4JHavN33wiwa8y81QdcMRLXQsrH9T53b';
// The id of the keyAgreementKey used for encryption verification
const encryptionId = 'did:key:z6MktKwz7Ge1Yxzr4JHavN33wiwa8y81QdcMRLXQsrH9T5' +
  '3b#z6LSfHfAMAopsuBxaBzvp51GXrPf38Az13j2fmwqadbwwrzJ';
// The id of the verificationMethod used for signature verification
const signatureId = 'did:key:z6MktKwz7Ge1Yxzr4JHavN33wiwa8y81QdcMRLXQsrH9T53' +
  'b#z6MktKwz7Ge1Yxzr4JHavN33wiwa8y81QdcMRLXQsrH9T53b';

describe('api', function() {
  it('should resolve did', async function() {
    const result = await makeRequest({did});
    shouldBeDidResolverResponse(result);
  });
  it('should resolve signature verification method', async function() {
    const result = await makeRequest({did: signatureId});
    shouldBeDidResolverResponse(result);
  });
  it('should resolve encryption verification method', async function() {
    const result = await makeRequest({did: encryptionId});
    shouldBeDidResolverResponse(result);
  });
});
