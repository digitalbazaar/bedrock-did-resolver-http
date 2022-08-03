/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */

export class MethodNotSupported extends Error {
  constructor(message) {
    super(message);
    this.name = 'MethodNotSupportedError';
    this.code = 'methodNotSupported';
  }
}

export class NotFound extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.code = 'notFound';
  }
}

export class InternalError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InternalError';
    this.code = 'internalError';
  }
}

