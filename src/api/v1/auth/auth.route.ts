import express, { NextFunction, Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { UserLogInValidator, UserSignUpValidator, validate } from "../../../middleware/validators.middleware";
import { logIn, register, tokenRefresh } from "./auth.controller";

const router = express.Router();

router.post(
  "/register",
  validate(UserSignUpValidator),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      const { accessToken, refreshToken } = await register({
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

router.post(
  "/login",
  validate(UserLogInValidator),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken } = await logIn({ email, password });

      res.status(StatusCodes.OK).json({
        accessToken,
        refreshToken,
      });
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).send(error);
    }
  }
);

router.post(
  "/refresh-token",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;
      const { accessToken, refreshToken } = await tokenRefresh(token);

      res.status(StatusCodes.OK).json({
        accessToken,
        refreshToken,
      });
    } catch (error) {
      res.status(StatusCodes.UNAUTHORIZED).send(error);
    }
  }
);

export default router;
