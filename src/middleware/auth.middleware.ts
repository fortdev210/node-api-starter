import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";

import { CustomError, ErrorCode } from "./error.middleware";

export const SECRET_KEY = process.env.JWT_SECRET_KEY || "JWT_SECRET_KEY";

export interface CustomRequest extends Request {
  token: string | JwtPayload;
}

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new CustomError(
        StatusCodes.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED,
        "Not authorized"
      );
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    (req as CustomRequest).token = decoded;

    next();
  } catch (err) {
    res.status(401).send(err);
  }
};
