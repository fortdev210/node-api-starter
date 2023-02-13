import express from "express";

import {
  UserLogInSchema,
  UserSignUpSchema,
  PasswordResetRequestSchema,
  ResetPasswordSchema,
} from "./auth.schema";
import {
  logIn,
  register,
  requestPasswordReset,
  tokenRefresh,
  resetPassword,
} from "./auth.controller";
import { validate } from "../../../middleware/validator.middleware";

const router = express.Router();

router.post("/register", validate(UserSignUpSchema), register);

router.post("/login", validate(UserLogInSchema), logIn);

router.post("/refresh-token", tokenRefresh);

router.post(
  "/request-password-reset",
  validate(PasswordResetRequestSchema),
  requestPasswordReset
);

router.post("/reset-password", validate(ResetPasswordSchema), resetPassword);

export default router;
