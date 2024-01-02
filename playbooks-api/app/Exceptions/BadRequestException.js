"use strict";

const { LogicalException } = require("@adonisjs/generic-exceptions");

class BadRequestException extends LogicalException {
  constructor(message, code) {
    super(message, 400, code);
  }

  handle(error, { response }) {
    response.status(400).send({
      success: false,
      code: this.code,
      message: error.message,
    });
  }
}

module.exports = BadRequestException;
