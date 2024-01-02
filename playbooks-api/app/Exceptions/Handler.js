"use strict";

const BaseExceptionHandler = use("BaseExceptionHandler");

/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler extends BaseExceptionHandler {
  /**
   * Handle exception thrown during the HTTP lifecycle
   *
   * @method handle
   *
   * @param  {Object} error
   * @param  {Object} options.request
   * @param  {Object} options.response
   *
   * @return {void}
   */
  async handle(error, ctx) {
    console.log(error);
    if (error.status === 422)
      return ctx.response.status(error.status).send({
        code: "BAD_REQUEST",
        message: error.message,
        status: error.status,
        errors: error["messages"]?.errors ? error["messages"].errors : "",
      });
    else if (error.code === "E_ROW_NOT_FOUND")
      return ctx.response.status(error.status).send({
        code: "BAD_REQUEST",
        message: "resource not found",
        status: 404,
      });
    else if (
      ["E_INVALID_AUTH_UID", "E_INVALID_AUTH_PASSWORD"].includes(
        error.code || ""
      )
    )
      return response.status(error.status).send({
        code: "BAD_REQUEST",
        message: "invalid credentials",
        status: 400,
      });
    return super.handle(error, ctx);
  }

  /**
   * Report exception for logging or debugging.
   *
   * @method report
   *
   * @param  {Object} error
   * @param  {Object} options.request
   *
   * @return {void}
   */
  async report(error, { request }) {}
}

module.exports = ExceptionHandler;
