import express from "express";

import {
  UserLogInSchema,
  UserSignUpSchema,
  validate,
} from "../../../middleware/validators.middleware";
import {
  logIn,
  register,
  confirmPasswordResetByEmail,
  tokenRefresh,
  resetPassword,
} from "./auth.controller";

const router = express.Router();

router.post("/register", validate(UserSignUpSchema), register);

router.post("/login", validate(UserLogInSchema), logIn);

router.post("/refresh-token", tokenRefresh);

router.post("/confirm-password-reset", confirmPasswordResetByEmail);

router.post("/reset-password", resetPassword);

export default router;
