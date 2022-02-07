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
      // this can be resolution or dereferencing meta data
      const metaData = {};
      const resolutionResult = {
        '@context': 'https://w3id.org/did-resolution/v1',
        didDocument: {},
        didDocumentMetadata: null,
        didResolutionMetadata: metaData
      };
      const {did} = req.params;
      const parsedDid = new URL(did);
      // if there is a fragment `#` or a service `?service`
      // then we are dereferencing a did url
      if(parsedDid.hash || parsedDid.search) {
        // add a did dereferencing meta
        resolutionResult.didDereferencingMetadata = metaData;
        // delete the resolution metadata
        delete resolutionResult.didResolutionMetadata;
      }
      // the second value should always be the method
      const [prefix, method, id] = did.split(':');
      // a did must have a did prefix, method, and id
      if(!((prefix === 'did') && method && id)) {
        metaData.error = 'invalidDidUrl';
        return res.status(400).json(resolutionResult);
      }
      if(!supportedMethods.includes(method)) {
        metaData.error = 'representationNotSupported';
        return res.status(406).json(resolutionResult);
      }
      try {
        resolutionResult.didDocument = await didIo.get({did});
      } catch(e) {
        logger.error('DID Resolution error', {error: e});
        // the spec doesn't seem to handle what occurs if the
        // did resolver fails for reason unrelated to the did such
        // as database timeouts.
        metaData.error = 'InternalError';
        return res.status(500).json(resolutionResult);
      }
      res.json(resolutionResult);
    }));
});
