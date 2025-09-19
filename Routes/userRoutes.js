import express from "express";
import { createUser, loginUser, getCurrentUserProfile, updateCurrentUserProfile, logoutCurrentUser } from "../Controllers/userController.js";
const router = express.Router();
import formidable from "express-formidable";
import { authenticate } from "../Middlewares/authMiddleware.js"; // Middleware to protect routes


router.route("/").post(formidable(), createUser);
router.post("/auth", formidable(), loginUser);
router.post("/logout", logoutCurrentUser);

router
  .route("/profile")
  .get(authenticate, getCurrentUserProfile)
  .put(authenticate, formidable(),updateCurrentUserProfile);

export default router;
