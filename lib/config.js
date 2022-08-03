/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
import {config} from '@bedrock/core';

const namespace = 'bedrock-did-resolver-http';
const cfg = config[namespace] = {};

// support did:key by default
// FIXME this can be expanded v1 aka veres-one at a later time
cfg.supportedMethods = ['key'];

const basePath = '/1.0/resolve/identifiers/:did';
cfg.routes = {basePath};
