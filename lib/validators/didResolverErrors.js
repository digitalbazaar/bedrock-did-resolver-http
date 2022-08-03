/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */

export class MethodNotSupported extends Error {
  constructor(message) {
    super(message);
    this.name = 'MethodNotSupportedError';
    this.code = 'methodNotSupported';
    this.statusCode = 400;
  }
}

export class NotFound extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.code = 'notFound';
    this.statusCode = 404;
  }
}

export class InternalError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InternalError';
    this.code = 'internalError';
    this.statusCode = 500;
  }
}

