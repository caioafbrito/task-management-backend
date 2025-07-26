import { Request, Response, NextFunction } from "express";

// Global Error Handler Middleware
const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorCode = error.code ?? 500;
  if (errorCode == 500 && !error.message) console.error(error);
  const message =
    error.message ?? "Unknown Error in the last validation. Contact admin.";

  return res.status(errorCode).json({
    message,
  });
};

export default errorHandler;
