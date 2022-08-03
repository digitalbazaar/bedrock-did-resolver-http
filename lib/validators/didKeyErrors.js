/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */

//FIXME these errors should probably be in did-method-key

export class InvalidPublicKey extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidPublicKeyError';
    this.code = 'invalidPublicKey';
    this.statusCode = 400;
  }
}

export class InvalidPublicKeyLength extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidPublicKeyLengthError';
    this.code = 'invalidPublicKeyLength';
    this.statusCode = 400;
  }
}

export class InvalidPublicKeyType extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidPublicKeyTypeError';
    this.code = 'invalidPublicKeyType';
    this.statusCode = 400;
  }
}

export class UnsupportedPublicKeyType extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnsupportedPublicKeyTypeError';
    this.code = 'unsupportedPublicKeyType';
    this.statusCode = 400;
  }
}
