export class InvalidAuthTokenError extends Error {
  constructor(message = "Invalid or expired authentication token.") {
    super(message);
    this.name = "InvalidAuthTokenError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor(message = "Invalid credentials.") {
    super(message);
    this.name = "InvalidCredentialsError";
  }
}

export class QrCodeGenerationError extends Error {
  constructor(message = "An error occurred during QR Code generation.") {
    super(message);
    this.name = "QrCodeGenerationError";
  }
}

export class CodeNotValidError extends Error {
  constructor(message = "The code is invalid.") {
    super(message);
    this.name = "CodeNotValidError";
  }
}
