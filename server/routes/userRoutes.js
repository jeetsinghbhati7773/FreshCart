import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  resetPassword,
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/me", authUser, getUserProfile);
router.post("/reset-password", resetPassword);

export default router;
