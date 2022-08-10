/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
import {config} from '@bedrock/core';

const namespace = 'bedrock-did-resolver-http';
const cfg = config[namespace] = {};

// a list of which did:methods we supported
cfg.supportedMethods = ['key', 'v1'];

const basePath = '/1.0/identifiers/resolve/:did';
cfg.routes = {basePath};
