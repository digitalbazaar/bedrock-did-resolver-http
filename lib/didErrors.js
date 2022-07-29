/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */

//FIXME these errors should probably be in did-method-key

export class InvalidDid extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidDidError';
    this.code = 'invalidDid';
  }
}

export class InvalidDidUrl extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidDidUrlError';
    this.code = 'invalidDidUrl';
  }
}
