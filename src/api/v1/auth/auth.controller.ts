import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { CustomError, ErrorCode } from "../../../middleware/error.middleware";
import {
  createUserByEmailAndPassword,
  findUserByEmail,
  findUserById,
  saveResetTokenInUser,
  updateUserPassword,
} from "../user/user.service";
import {
  addRefreshTokenToWhitelist,
  deleteRefreshToken,
  findRefreshTokenById,
  generateTokens,
  hashToken,
} from "./auth.service";
import { sendPasswordResetEmail } from "../../../services/email/email.service";

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "JWT_SECRET_KEY";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      throw new CustomError(
        StatusCodes.BAD_REQUEST,
        ErrorCode.EMAIL_ALREADY_EXIST,
        "Email already in use"
      );
    }

    const createdUser = await createUserByEmailAndPassword({
      email,
      password,
      firstName,
      lastName,
    });
    const jti = uuidv4();

    const { accessToken, refreshToken } = generateTokens(createdUser, jti);
    await addRefreshTokenToWhitelist({
      jti,
      refreshToken,
      userId: createdUser.id,
    });

    res.status(StatusCodes.CREATED).json({
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

export const logIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const existingUser = await findUserByEmail(email);

    if (!existingUser) {
      throw new CustomError(
        StatusCodes.BAD_REQUEST,
        ErrorCode.INVALID_CREDENTIAL,
        "Invalid email and password"
      );
    }

    const validPassword = await bcrypt.compare(password, existingUser.password);

    if (!validPassword) {
      throw new CustomError(
        StatusCodes.BAD_REQUEST,
        ErrorCode.INVALID_CREDENTIAL,
        "Password is not correct."
      );
    }

    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(existingUser, jti);

    await addRefreshTokenToWhitelist({
      jti,
      refreshToken,
      userId: existingUser.id,
    });

    res.status(StatusCodes.OK).json({
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

export const tokenRefresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // accept refresh token from request body
    const { refreshToken } = req.body;

    const payload = jwt.verify(refreshToken, JWT_SECRET_KEY) as JwtPayload;

    const savedRefreshToken = await findRefreshTokenById(payload.jti as string);

    if (!savedRefreshToken || savedRefreshToken.revoked === true) {
      throw new CustomError(
        StatusCodes.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED,
        "Unauthorized."
      );
    }

    const hashedToken = hashToken(refreshToken);
    if (hashedToken !== savedRefreshToken.hashedToken) {
      throw new CustomError(
        StatusCodes.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED,
        "Unauthorized."
      );
    }

    const user = await findUserById(payload.userId);
    if (!user) {
      throw new CustomError(
        StatusCodes.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED,
        "Unauthorized."
      );
    }

    await deleteRefreshToken(savedRefreshToken.id);

    const jti = uuidv4();
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user,
      jti
    );

    await addRefreshTokenToWhitelist({
      jti,
      refreshToken: newRefreshToken,
      userId: user.id,
    });

    res.status(StatusCodes.CREATED).json({
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

export const requestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const existingUser = await findUserByEmail(email);
    if (!existingUser) {
      throw new CustomError(
        StatusCodes.BAD_REQUEST,
        ErrorCode.INVALID_CREDENTIAL,
        "Invalid email and password"
      );
    }
    const resetToken = uuidv4();

    const token = jwt.sign(
      { userId: existingUser.id, resetToken },
      JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    await saveResetTokenInUser(existingUser.id, resetToken);
    await sendPasswordResetEmail(existingUser.email, token);
    res.json({
      status: "success",
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { password, token } = req.body;

    const { userId, resetToken } = jwt.verify(
      token,
      JWT_SECRET_KEY
    ) as JwtPayload;

    const existingUser = await findUserById(userId);

    if (!existingUser) {
      throw new CustomError(
        StatusCodes.BAD_REQUEST,
        ErrorCode.USER_NOT_FOUND,
        "User with that id does not exist."
      );
    }

    if (resetToken !== existingUser.reset_token) {
      throw new CustomError(
        StatusCodes.BAD_REQUEST,
        ErrorCode.USER_NOT_FOUND,
        "Wrong reset token"
      );
    }
    await updateUserPassword(existingUser.id, password);

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
