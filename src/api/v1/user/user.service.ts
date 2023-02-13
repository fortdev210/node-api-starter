import { User, EmailVerificationCode } from "@prisma/client";
import bcrypt from "bcrypt";
import { CustomError, ErrorCode } from "../../../middleware/error.middleware";
import db from "../../../utils/db";
import { generateVerificationCode } from "../../../utils/generate-verification-code";
import { StatusCodes } from "http-status-codes";
import { sendTextEmail } from "../../../services/email/email.service";
import { EMAIL_SUBJECT } from "../../../utils/const";

export type TUser = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export const findUserByEmail = (email: string) => {
  return db.user.findUnique({
    where: {
      email,
    },
  });
};

export const createUserByEmailAndPassword = (user: TUser) => {
  user.password = bcrypt.hashSync(user.password, 12);
  return db.user.create({
    data: user,
  });
};

export const findUserById = (id: string) => {
  return db.user.findUnique({
    where: {
      id,
    },
  });
};

export const saveResetTokenInUser = (id: string, resetToken: string) => {
  return db.user.update({
    where: {
      id: id,
    },
    data: {
      reset_token: resetToken,
      reset_token_expires_at: new Date(Date.now() + 3600000),
    },
  });
};

export const updateUserPassword = (id: string, password: string) => {
  const newPassword = bcrypt.hashSync(password, 12);

  return db.user.update({
    where: {
      id: id,
    },
    data: {
      password: newPassword,
    },
  });
};

export const sendVerificationCodeToEmail = async (email: string) => {
  const code = generateVerificationCode();

  const user = await db.user.findFirst({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw new CustomError(
      StatusCodes.BAD_REQUEST,
      ErrorCode.USER_NOT_FOUND,
      "User with that email not found."
    );
  }

  // Keep the verification code somewhere in database.
  await db.emailVerificationCode.create({
    data: {
      code: code,
      email,
    },
  });

  await sendTextEmail(
    email,
    EMAIL_SUBJECT.VERIFY_YOUR_EMAIL,
    `Your email verification code is ${code}`
  );
};

export const checkVerificationCode = async (email: string, code: string) => {
  const user: User | null = await db.user.findFirst({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw new CustomError(
      StatusCodes.BAD_REQUEST,
      ErrorCode.USER_NOT_FOUND,
      "User with that email not found."
    );
  }

  const verificationCode: EmailVerificationCode | null =
    await db.emailVerificationCode.findFirst({
      where: {
        email: email,
        code,
      },
    });

  if (!verificationCode) {
    throw new CustomError(
      StatusCodes.BAD_REQUEST,
      ErrorCode.VERIFICATION_CODE_NOT_FOUND,
      "Invalid email and verification code."
    );
  }
  // TODO: Check if code has been expired or not. Code expiration time is 1 hour or so...
  if (verificationCode.code === code) {
    await db.user.update({
      where: {
        email,
      },
      data: {
        is_email_verified: true,
      },
    });
  } else {
    throw new CustomError(
      StatusCodes.BAD_REQUEST,
      ErrorCode.WRONG_VERIFICATION_CODE,
      "Wrong verification code."
    );
  }
};
