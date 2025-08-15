import { Request, Response, NextFunction } from "express";

const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    error.name === "AuthenticationError" ||
    error.name === "Unauthorized" ||
    error.name === "UnauthorizedError" ||
    error.name === "TokenExpiredError" ||
    error.name === "JsonWebTokenError" ||
    error.name === "NotBeforeError"
  ) {
    return res.status(401).json({ message: error.message || "Unauthorized" });
  }

  const statusCode = error.code ?? 500;
  if (statusCode === 500 && !error.message) console.error(error);

  const message = error.message ?? "Unknown Error";

  return res.status(statusCode).json({ message });
};

export default errorHandler;
