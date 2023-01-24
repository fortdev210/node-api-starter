import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "@prisma/client";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "secretkey";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "jwtrefreshsecret";

export const generateAccessToken = (user: User) => {
  return jwt.sign({ userId: user.id }, JWT_ACCESS_SECRET, {
    expiresIn: "1h",
  });
};

export const generateRefreshToken = (user: User, jti: string) => {
  return jwt.sign(
    {
      userId: user.id,
      jti,
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: "8h",
    }
  );
};

export const generateTokens = (user: User, jti: string) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, jti);

  return {
    accessToken,
    refreshToken,
  };
};

export const hashToken = (token: string) => {
  return crypto.createHash("sha512").update(token).digest("hex");
};
