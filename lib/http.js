/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
import {asyncHandler} from 'bedrock-express';
import bedrock from 'bedrock';
import {didIo} from 'bedrock-did-io';
const {config} = bedrock;

bedrock.events.on('bedrock-express.configure.routes', app => {
  const {routes, supportedMethods} = config['bedrock-did-resolver-http'];
  app.post(
    routes.basePath,
    asyncHandler(async (req, res) => {
      const resolutionResult = {
        '@context': 'https://w3id.org/did-resolution/v1',
        didDocument: null,
        didDocumentMetadata: null,
        did-dereferencing-metadata: {}
      };
      const {did} = req.params; 
      const [did, method] = did.split(':');
      if(did != 'did') {
        resolutionResult.did-dereferencing-metadata.error = 'invalid-didUrl';
        res.status(400).json(resolutionResult);
      }
      if(!supportedMethods.includes(method)){
        resolutionResult.did-dereferencing-metadata.error = 'method-not-supported';
        res.status(406).json(resolutionResult);
      }
      resolutionResult.didDocument = await didIo.get({did}); 
      res.json(resolutionResult);
    }));
});
