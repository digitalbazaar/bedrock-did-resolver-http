/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */

import {DidResolverError} from '@digitalbazaar/did-io';

/**
 * Validates the components of a did.
 *
 * @param {object} options - Options to use.
 * @param {string} options.method - The did method of the did
 *   being resolved.
 * @param {Array<string>} options.supportedMethods - A list of
 *   did:key methods this implementation supports.
 *
 * @throws {Error} Throws did related errors.
 *
 * @returns {boolean} - Are the did components valid?
 */
// fixme this should probably be moved into the did-method-key
// get function and be run before returning a didDocument
export const validateDidRequest = ({
  method,
  supportedMethods,
}) => {
  // this is for conformance with the did resolver spec
  if(!supportedMethods.includes(method)) {
    throw new DidResolverError({
      message: `Unsupported method ${method}`,
      code: 'methodNotSupported'
    });
  }
};
