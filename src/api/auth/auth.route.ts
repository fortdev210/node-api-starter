import express, { Request, Response, NextFunction } from "express";
import { signUpUser } from "./auth.controller";

const router = express.Router();

router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      const { accessToken, refreshToken } = await signUpUser({
        email,
        password,
        firstName,
        lastName,
      });

      res.json({
        accessToken,
        refreshToken,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
