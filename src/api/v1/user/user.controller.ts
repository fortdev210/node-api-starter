import { Request, Response, NextFunction } from "express";
import {
  sendVerificationCodeToEmail,
  checkVerificationCode,
} from "./user.service";

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    await sendVerificationCodeToEmail(email);

    res.status(201).json({
      status: "success",
      message: "Verification code has been sent",
    });
  } catch (error) {
    next(error);
  }
};

export const confirmVerificationCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, code } = req.body;
    await checkVerificationCode(email, code);

    res.status(201).json({
      status: "success",
      message: "Email verified",
    });
  } catch (error) {
    next(error);
  }
};
