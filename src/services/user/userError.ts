export class UserNotFoundError extends Error {
  constructor(message = "User not found.") {
    super(message);
    this.name = "UserNotFoundError";
  }
}

export class DuplicatedUserEmailError extends Error {
  constructor(message = "The email provided is already in use.") {
    super(message);
    this.name = "DuplicatedUserEmailError";
  }
}

export class SecretNotFoundError extends Error {
  constructor(message = "Secret not found.") {
    super(message);
    this.name = "SecretNotFoundError";
  }
}
