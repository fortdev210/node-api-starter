import { User } from "@prisma/client";
import bcrypt from "bcrypt";

import db from "../../../utils/db";

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
