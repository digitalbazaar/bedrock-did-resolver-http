/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import {asyncHandler} from 'bedrock-express';
import bedrock from 'bedrock';
import {didIo} from 'bedrock-did-io';
import logger from './logger';
const {config} = bedrock;

bedrock.events.on('bedrock-express.configure.routes', app => {
  const {routes, supportedMethods} = config['bedrock-did-resolver-http'];
  app.get(
    routes.basePath,
    asyncHandler(async (req, res) => {
      const resolutionResult = {
        '@context': 'https://w3id.org/did-resolution/v1',
        didDocument: null,
        didDocumentMetadata: null,
        didDereferencingMetadata: {}
      };
      const {did} = req.params;
      // the second value should always be the method
      const [prefix, method, id] = did.split(':');
      // a did must have a did prefix, method, and id
      if(!((prefix === 'did') && method && id)) {
        resolutionResult.didDereferencingMetadata.error = 'invalid-didUrl';
        return res.status(400).json(resolutionResult);
      }
      if(!supportedMethods.includes(method)) {
        resolutionResult.didDereferencingMetadata.error =
          'method-not-supported';
        return res.status(406).json(resolutionResult);
      }
      try {
        resolutionResult.didDocument = await didIo.get({did});
      } catch(e) {
        logger.error('DID Resolution error', {error: e});
        // the spec doesn't seem to handle what occurs if the
        // did resolver fails for reason unrelated to the did such
        // as database timeouts.
        resolutionResult.didDereferencingMetadata.error = 'InternalError';
        return res.status(500).json(resolutionResult);
      }
      res.json(resolutionResult);
    }));
});
