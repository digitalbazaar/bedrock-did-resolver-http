/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
import bedrock from 'bedrock';
const {config} = bedrock;

const namespace = 'bedrock-did-resolver-http';
const cfg = config[namespace] = {};

const basePath = '/did';
cfg.routes = {
  basePath
};
