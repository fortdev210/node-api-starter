import express, { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import {
  UserSignUpValidator,
  validate,
} from "../../middleware/validators.middleware";
import { signUpUser } from "./auth.controller";

const router = express.Router();

router.post(
  "/register",
  validate(UserSignUpValidator),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      const { accessToken, refreshToken } = await signUpUser({
        email,
        password,
        firstName,
        lastName,
      });

      res.status(StatusCodes.CREATED).json({
        accessToken,
        refreshToken,
      });
    } catch (err) {
      res.status(StatusCodes.BAD_REQUEST).send(err);
    }
  }
);

export default router;
