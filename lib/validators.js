/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */

import * as didErrors from './didErrors.js';
import * as didKeyErrors from './didKeyErrors.js';
import {getDidComponents} from './didComponents.js';

export const validateDid = did => {
  const didComponents = getDidComponents({did});
  return _validateDidComponents({didComponents});
};

/**
 * Validates the components of a did.
 *
 * @param {object} options - Options to use.
 * @param {object} options.didComponents - An object with
 *   various did components.
 *
 * @throws {Error} Throws did related errors.
 *
 * @returns {boolean} - Are the did components valid?
 */
// fixme this should probably be moved into the did-method-key
// get function and be run before returning a didDocument
function _validateDidComponents({didComponents}) {
  const didKeyCompliant = _validateDidKey({didComponents});
  const ed25519Compliant = _validateMultibaseEd25519({didComponents});
  return didKeyCompliant && ed25519Compliant;
}

/**
 * General validation for did:keys indendenpent
 * of key type specific validation.
 *
 * @param {object} options - Options to use.
 * @param {object} options.didComponents - An object with
 *   did components such as schema and method.
 *
 * @throws {Error} Throws general did:key errors.
 *
 * @returns {boolean} If the didComponents are valid.
 */
function _validateDidKey({didComponents}) {
  const {scheme, method, version, multibase = ''} = didComponents;
  if(scheme !== 'did') {
    throw new didErrors.InvalidDid(`Scheme must be "did" received "${scheme}"`);
  }
  if(method !== 'key') {
    throw new didErrors.InvalidDid(`Method must be "key" received "${method}"`);
  }
  const validVersion = _validateVersion({version});
  if(!multibase.startsWith('z')) {
    throw new didErrors.InvalidDid(
      `Multibase must start with "z" received ${multibase[0]}`);
  }
  return validVersion;
}

function _validateVersion({version}) {
  try {
    const versionNumber = Number.parse(version);
    if(versionNumber <= 0) {
      throw new didErrors.InvalidDid(
        `Version must be a positive integer recieved "${versionNumber}"`);
    }
  } catch(e) {
    throw new didErrors.InvalidDid(
      `Version must be a number received "${version}"`);
  }
  return true;
}

function _validateMultibaseEd25519({didComponents}) {
  const {multibase} = didComponents;
}
