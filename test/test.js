/*
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */

const bedrock = require('bedrock');
require('bedrock-https-agent');
require('bedrock-mongodb');
require('bedrock-did-resolver-http');

require('bedrock-test');
bedrock.start();
