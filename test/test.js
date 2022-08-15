/*
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import '@bedrock/https-agent';
import '@bedrock/mongodb';
import 'bedrock-did-resolver-http';
import '@bedrock/test';

bedrock.start().catch(err => console.error(err));
