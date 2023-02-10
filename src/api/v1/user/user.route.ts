import express from "express";
import { verifyEmail, confirmVerificationCode } from "./user.controller";

const router = express.Router();

router.post("/verify-email", verifyEmail);
router.post("/confirm-code", confirmVerificationCode);

export default router;
