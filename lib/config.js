/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
import {config} from '@bedrock/core';

const namespace = 'bedrock-did-resolver-http';
const cfg = config[namespace] = {};

// support did:key and veres one keys by default
cfg.supportedMethods = ['key', 'v1'];

const basePath = '/1.0/resolve/identifiers/:did';
cfg.routes = {basePath};
