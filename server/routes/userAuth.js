import express from "express";
import authUser from "../middlewares/authUser.js";
import { getUserProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", authUser, getUserProfile); // Protected route

export default router;
