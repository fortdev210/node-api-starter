import { v4 as uuidv4 } from "uuid";
import { CustomError, ErrorCode } from "../../utils/custom-error";
import { generateTokens } from "../../utils/jwt";
import { addRefreshTokenToWhitelist } from "../auth/auth.service";
import {
  createUserByEmailAndPassword,
  findUserByEmail,
  TUser,
} from "../user/user.service";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";

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
