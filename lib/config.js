/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
import {config} from '@bedrock/core';

const namespace = 'bedrock-did-resolver-http';
const cfg = config[namespace] = {};

// a list of which did:methods we supported
// experimental is for tests only
cfg.supportedMethods = ['key', 'v1', 'experimental'];
// FIXME this can be expanded to support Multikey or JsonWebKey2020
cfg.publicKeyFormats = [
  'Ed25519VerificationKey2020',
  'X25519KeyAgreementKey2020',
  // this is strictly for testing
  'ExperimentalVerificationKey2022'
];

const basePath = '/1.0/resolve/identifiers/:did';
cfg.routes = {basePath};
