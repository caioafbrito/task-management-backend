import { Request, Response, NextFunction } from "express";
import { ApiError } from "utils/error.js";
import jwt from "jsonwebtoken";

export const authCheck = async (req: Request, res: Response, next: NextFunction) => {
    let authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) return next(new ApiError("Authorization header missing.", 400));
    if (Array.isArray(authHeader)) authHeader = authHeader[0];
    const [, token] = authHeader.split(" ");
    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
        req.user = payload;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            next(new ApiError("Token expired", 401));
        } else if (error instanceof jwt.JsonWebTokenError) {
            next(new ApiError("Invalid token or malformed request.", 401));
        } else if (error instanceof jwt.NotBeforeError) {
            next(new ApiError("Token is not yet active", 401));
        } else if (error instanceof ApiError) {
            next(error);
        } else {
            next(new ApiError("An unexpected authentication error occurred.", 500));
        }
    }
}


export const multipleAuthCheck = async (req: Request, res: Response, next: NextFunction) => { // if it is 2fa or no
    let token = req.headers.authorization || req.headers.Authorization;
    if (!token) return next(new ApiError("Authorization header missing.", 400));
    if (Array.isArray(token)) token = token[0];
    const [, tokenValue] = token.split(" ");
    try {
        const payload = jwt.verify(tokenValue, process.env["2FA_TOKEN_SECRET"]!);
        req.user = payload;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            next(new ApiError("Token expired", 401));
        } else if (error instanceof jwt.JsonWebTokenError) {
            next(new ApiError("Invalid token or malformed request.", 401));
        } else if (error instanceof jwt.NotBeforeError) {
            next(new ApiError("Token is not yet active", 401));
        } else if (error instanceof ApiError) {
            next(error);
        } else {
            next(new ApiError("An unexpected authentication error occurred.", 500));
        }
    }
}