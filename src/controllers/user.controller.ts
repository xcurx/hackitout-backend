import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { fieldChecker } from "../utils/fieldChecker.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../middleware/authenticateToken.js";

const prisma = new PrismaClient();

const signUp = asyncHandler(async (req:Request, res:Response) => {
    const { email, password } = req.body;
    fieldChecker({email, password}, ['email', 'password']);

    const userExists = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if(userExists){
        throw new ApiError(400, "User already exists");
    }

    const user = await prisma.user.create({
        data: {
            email,
            password: await bcrypt.hash(password, 10),
        },
    });
    
    res.status(201).json(new ApiResponse(201, user, "User created successfully"));
});

const signIn = asyncHandler(async (req:Request, res:Response) => {
    const { email, password } = req.body;
    fieldChecker({email, password}, ['email', 'password']);

    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if(!user){
        new ApiError(400, "User not found");
    }
 
    const isMatch = await bcrypt.compare(password, user?.password as string);
    if(!isMatch){
        throw new ApiError(400, "Invalid credentials");
    }

    const token = jwt.sign({id: user?.id}, process.env.JWT_SECRET!, {
        expiresIn: "1d",
    });

    res.status(200).json(new ApiResponse(200, {token}, "User logged in successfully"));
})

const getProfile = asyncHandler(async (req:AuthenticatedRequest, res:Response) => {
    console.log(req.user);
    const user = await prisma.user.findUnique({
        where: {
            id: (req.user as jwt.JwtPayload).id as string,
        },
        select: {
            email: true,
            id: true,
        },
    });
    res.status(200).json(new ApiResponse(200, user as object,"User profile fetched successfully"));
});

export { 
    signUp, 
    signIn,
    getProfile,
};

