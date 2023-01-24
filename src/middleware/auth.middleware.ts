import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { CustomError, ErrorCode } from "../utils/custom-error";

export const SECRET_KEY: Secret = "your-secret-key-here";

export interface CustomRequest extends Request {
  token: string | JwtPayload;
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new CustomError(400, ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    (req as CustomRequest).token = decoded;

    next();
  } catch (err) {
    res.status(401).send(err);
  }
};
