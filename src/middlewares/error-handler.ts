import { Request, Response, NextFunction } from "express";

// Global Error Handler Middleware
const errorHandler = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    return res.status(error.code ?? 500).json({
        message: error.message ?? "Unknown Error",
    });
};

export default errorHandler;
