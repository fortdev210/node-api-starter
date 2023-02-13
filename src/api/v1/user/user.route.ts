import express from "express";
import { verifyEmail, confirmVerificationCode } from "./user.controller";
import {
  VerifyEmailSchema,
  ConfirmVerificationCodeSchema,
} from "./user.schema";
import { validate } from "../../../middleware/validator.middleware";

const router = express.Router();

router.post("/verify-email", validate(VerifyEmailSchema), verifyEmail);

router.post(
  "/confirm-code",
  validate(ConfirmVerificationCodeSchema),
  confirmVerificationCode
);

export default router;
