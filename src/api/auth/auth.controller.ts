import { v4 as uuidv4 } from "uuid";
import { generateTokens } from "../../utils/jwt";
import { addRefreshTokenToWhitelist } from "../auth/auth.service";
import {
  findUserByEmail,
  createUserByEmailAndPassword,
  TUser,
} from "../user/user.service";
import { CustomError, ErrorCode } from "../../middleware/error.middleware";

export const signUpUser = async (user: TUser) => {
  const { email, password, firstName, lastName } = user;
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new CustomError(
      400,
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
