import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload | string; 
}

const authenticateToken = asyncHandler(async (req:AuthenticatedRequest, res:Response, next:NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader;

    if(!token) throw new ApiError(401, "Unauthorized"); 

    jwt.verify(token as string, process.env.JWT_SECRET as string, (err, user) => {
        if (err) throw new ApiError(403, "Invalid token");

        req.user = user; 
        next();
    });
});

export { authenticateToken }