class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);               // initialize the built-in Error
    this.statusCode = statusCode;
    this.success = false;
    this.message = message;
    this.errors = errors;         // array of error details
    this.data = null;             // optional data field

    // Set custom stack if provided, else use default
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
