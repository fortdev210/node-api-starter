import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { CustomError, ErrorCode } from "../../utils/custom-error";
import { generateTokens, hashToken } from "../../utils/jwt";
import {
  addRefreshTokenToWhitelist,
  deleteRefreshToken,
  findRefreshTokenById,
} from "../auth/auth.service";
import {
  createUserByEmailAndPassword,
  findUserByEmail,
  findUserById,
  TUser,
} from "../user/user.service";

const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET_KEY || "JWT_REFRESH_SECRET_KEY";

export const register = async (user: TUser) => {
  const { email, password, firstName, lastName } = user;
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

  return {
    accessToken,
    refreshToken,
  };
};

export const logIn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
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

  return {
    accessToken,
    refreshToken,
  };
};

export const tokenRefresh = async (refreshToken: string) => {
  const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JwtPayload;

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

  return {
    accessToken,
    refreshToken,
  };
};
