/*
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */

const {config} = require('bedrock');
const path = require('path');

// MongoDB
config.mongodb.name = 'bedrock_did_resolver_http_test';
config.mongodb.dropCollections.onInit = true;
config.mongodb.dropCollections.collections = [];

config.mocha.tests.push(path.join(__dirname, 'mocha'));

// allow self-signed certs in test framework
config['https-agent'].rejectUnauthorized = false;
