import { User } from "@prisma/client";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import db from "../../../utils/db";

const JWT_ACCESS_SECRET = process.env.JWT_SECRET_KEY || "secretkey";
const JWT_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY || "jwtrefreshsecret";

export const generateAccessToken = (user: User) => {
  return jwt.sign({ userId: user.id }, JWT_ACCESS_SECRET, {
    expiresIn: "1h",
  });
};

export const addRefreshTokenToWhitelist = ({
  jti,
  refreshToken,
  userId,
}: {
  jti: string;
  refreshToken: string;
  userId: string;
}) => {
  return db.refreshToken.create({
    data: {
      id: jti,
      hashedToken: hashToken(refreshToken),
      userId,
    },
  });
};

export const findRefreshTokenById = (id: string) => {
  return db.refreshToken.findUnique({
    where: {
      id,
    },
  });
};

export const deleteRefreshToken = (id: string) => {
  return db.refreshToken.update({
    where: {
      id,
    },
    data: {
      revoked: true,
    },
  });
};

export const revokeTokens = (userId: string) => {
  return db.refreshToken.updateMany({
    where: {
      userId,
    },
    data: {
      revoked: true,
    },
  });
};

export const hashToken = (token: string) => {
  return crypto.createHash("sha512").update(token).digest("hex");
};

export const generateRefreshToken = (user: User, jti: string) => {
  return jwt.sign(
    {
      userId: user.id,
      jti,
    },
    JWT_SECRET_KEY,
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

export const generatePasswordResetToken = (userId: string) => {};
