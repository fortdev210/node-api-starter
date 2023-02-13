import { ErrorRequestHandler, Request, Response, NextFunction } from "express";

export enum ErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_TOKEN = "INVALID_TOKEN",
  UKNOWN_ERROR = "UKNOWN_ERROR",
  EMAIL_ALREADY_EXIST = "EMAIL_ALREADY_EXIST",
  INVALID_CREDENTIAL = "INVALID_CREDENTIAL",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  VERIFICATION_CODE_NOT_FOUND = "VERIFICATION_CODE_NOT_FOUND",
  WRONG_VERIFICATION_CODE = "WRONG_VERIFICATION_CODE",
}

export class CustomError {
  status: number;
  errCode: ErrorCode;
  description: string;

  constructor(status: number, errCode: ErrorCode, description: string) {
    this.status = status;
    this.errCode = errCode;
    this.description = description;
  }
}

export const errorMiddleware: ErrorRequestHandler = (
  err,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.status || err.statusCode || 500;
  let errCode: ErrorCode;
  if (err.name === "UnauthorizedError") {
    errCode = ErrorCode.UNAUTHORIZED;
  } else if (err.code === "invalid_token") {
    errCode = ErrorCode.INVALID_TOKEN;
  } else {
    errCode = err.errCode || ErrorCode.UKNOWN_ERROR;
  }
  const description = err.description || err.message || "Something went wrong!";

  res.status(statusCode).json({ errCode: errCode, description: description });
};
