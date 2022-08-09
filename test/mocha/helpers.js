/*
 * Copyright (c) 2021-2022 Digital Bazaar, Inc. All rights reserved.
 */

import {agent} from '@bedrock/https-agent';
import {httpClient} from '@digitalbazaar/http-client';

const headers = {
  Accept: 'application/ld+json;profile="https://w3id.org/did-resolution"'
};

export const makeRequest = async ({did}) => {
  const basePath = '/1.0/identifiers/resolve/';
  const url = `https://localhost:52443${basePath}${encodeURIComponent(did)}`;
  const {data} = await httpClient.get(url, {headers, agent});
  return data;
};

