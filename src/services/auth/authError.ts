export class InvalidAuthTokenError extends Error {
    constructor(message = "Invalid or expired authentication token") {
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
