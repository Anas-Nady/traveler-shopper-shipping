import express from "express";
import {
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  verifyEmail,
} from "../controllers/authController";
import upload from "../config/multer";

const router = express.Router();

router.post("/register", upload.single("photo"), register);

router.get("/verify-email", verifyEmail);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:resetToken", resetPassword);

router.post("/logout", logout);

export default router;
