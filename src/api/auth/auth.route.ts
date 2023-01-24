import express, { Request, Response, NextFunction } from "express";
import { signUpUser } from "./auth.controller";
import {
  UserSignUpValidator,
  validate,
} from "../../middleware/validators.middleware";

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

      res.status(201).json({
        accessToken,
        refreshToken,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
