/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import {asyncHandler} from '@bedrock/express';
import logger from './logger.js';
import {resolveDid} from './didResolver.js';
const {config} = bedrock;

bedrock.events.on('bedrock-express.configure.routes', app => {
  const {
    routes,
    supportedMethods,
  } = config['bedrock-did-resolver-http'];
  app.get(
    routes.basePath,
    asyncHandler(async (req, res) => {
      const {did} = req.params;
      // did options are passed to the resolver via url queries
      // except some are headers on the request
      const didOptions = {...req.query};
      const resolverOptions = {...req.headers};
      try {
        const {statusCode, resolutionResult} = await resolveDid({
          did,
          supportedMethods,
          didOptions,
          resolverOptions
        });
        res.status(statusCode).json(resolutionResult);
      } catch(error) {
        logger.error(`DID resolution error ${did}`, {error});
        throw error;
      }
    }));
});
