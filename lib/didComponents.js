/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */

/**
 * Using a colon (:) as the delimiter, split the identifier
 * into its components: a scheme, a method, a version, and a
 * multibaseValue. If there are only three components set the
 * version to the string value 1 and use the last value as
 * the multibaseValue.
 *
 * @param {object} options - Options to use.
 * @param {string} options.did - A did as a string.
 *
 * @returns {object} The components of the did.
*/
export const getDidKeyComponents = ({did}) => {
  const didUrl = new URL(did);
  // if there is a fragment `#` or a service `?service` or it contains /
  // then we are dereferencing a did url
  const isDidUrl = /[\/#?]/.test(did);
  // split on : unless : is the last character in a did url /(?!:$):/
  const parts = did.split(/(?!:$):/);
  const [scheme, method, version, multibase] = parts;
  return {
    scheme,
    method,
    // if multibase exists use the version
    version: multibase ? version : '1',
    // multibase maybe undefined
    // if multibase exists use multibase
    multibase: multibase || version,
    parts,
    did,
    // contains the fragment to dereference
    fragment: didUrl.hash,
    // contains the search string
    search: didUrl.search,
    // contains a map with key value pairs
    searchParams: didUrl.searchParams,
    isDidUrl
  };
};
