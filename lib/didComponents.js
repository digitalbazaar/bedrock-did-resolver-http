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
  const {
    isDidUrl,
    didEndIndex,
    fragment,
    search,
    searchParams
  } = _getUrlComponents({did});
  // the identifier should be the did before the url syntax starts
  const identifier = isDidUrl ? did.substring(0, didEndIndex) : did;
  // split on : unless : is the last character in a did url /(?!:$):/
  const parts = identifier.split(/(?!:$):/);
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
    identifier,
    // contains the fragment to dereference
    fragment,
    // contains the search string
    search,
    // contains a map with key value pairs
    searchParams,
    isDidUrl
  };
};

/**
 * If the did is a did url it gets the fragment and searchParams.
 *
 * @private
 *
 * @param {object} options - Options to use.
 * @param {string} options.did - A potential did url.
 *
 * @returns {object} The resulting url components.
 */
function _getUrlComponents({did}) {
  // if there is a fragment `#` or a service `?service` or it contains /
  // then we are dereferencing a did url
  const urlParts = /[\/#?]/;
  const urlMatch = urlParts.exec(did);
  if(urlMatch) {
    const urlParts = new URL(did);
    return {
      isDidUrl: true,
      fragment: urlParts.hash,
      search: urlParts.search,
      searchParams: urlParts.searchParams,
      didEndIndex: urlMatch.index
    };
  }
  return {
    isDidUrl: false
  };
}
