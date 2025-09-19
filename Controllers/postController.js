import Comment from "../Models/commentModel.js";
import Blog from "../Models/blogModel.js"; // Renamed from Post
import asyncHandler from "../Middlewares/asyncHandler.js";

// Add a Comment or Reply
export const addComment = asyncHandler(async (req, res) => {
    const { text, parentCommentId } = req.body;
    const blogPostId = req.params.blogId;

    if (!text) {
        res.status(400);
        throw new Error("Comment text is required!");
    }

    const blogPost = await Blog.findById(blogPostId);
    if (!blogPost) {
        res.status(404);
        throw new Error("Blog post not found!");
    }

    const newComment = new Comment({
        text,
        user: req.user._id,
        blogPost: blogPostId,
        parentComment: parentCommentId || null,
    });

    try {
        const savedComment = await newComment.save();

        // If it's a reply, update the parent comment
        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (parentComment) {
                parentComment.replies.push(savedComment._id);
                await parentComment.save();
            }
        }

        res.status(201).json({
            message: "Comment added successfully!",
            comment: savedComment,
        });
    } catch (error) {
        res.status(500);
        throw new Error("Failed to add comment!");
    }
});

// Get all comments for a blog post
export const getCommentsForBlog = asyncHandler(async (req, res) => {
    const blogPostId = req.params.blogId;

    const comments = await Comment.find({ blogPost: blogPostId })
        .populate("user", "name")
        .populate({
            path: "replies",
            populate: { path: "user", select: "name" },
        });

    if (!comments || comments.length === 0) {
        return res
            .status(404)
            .json({ message: "No comments found for this blog post!" });
    }

    res.status(200).json(comments);
});