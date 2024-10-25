import express from "express";
import { getMe, login, logout, register } from "../controller/auth.controllers.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/profile', protectRoute, getMe);

export default router