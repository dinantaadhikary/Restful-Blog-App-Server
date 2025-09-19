import express from "express";
import {
  createPost,
  addComment,
  toggleLike,
  toggleBookmark,
  searchBlogsByTitle,
  updateOrPublishBlogPost,
  getUserBlogPosts,
  deleteBlogPost,
  getAuthorDrafts,
  getCommentsForBlog,
} from "../Controllers/blogController.js";
import upload from "./uploadRoutes.js";
import { authenticate } from "../Middlewares/authMiddleware.js"; // Middleware to protect routes

const router = express.Router();

// Route to create a new post
router.route("/").post(authenticate, upload.single("image"), createPost);
router.post("/:blogId/comments", authenticate, addComment)
router.get("/:blogId/comments",authenticate, getCommentsForBlog);

router.post("/:postId/like", authenticate, toggleLike);
router.post("/:postId/bookmark", authenticate, toggleBookmark);
router.get("/search", authenticate, searchBlogsByTitle);
router.get("/drafts", authenticate, getAuthorDrafts);
router
  .route("/:id")
  .put(authenticate, updateOrPublishBlogPost)
  .delete(authenticate, deleteBlogPost);
router.get("/postlist", authenticate, getUserBlogPosts);

export default router;
