import Blog from "../Models/blogModel.js";
import Comment from "../Models/commentModel.js";
import asyncHandler from "../Middlewares/asyncHandler.js";

// Create a new blog post with an image
const createPost = asyncHandler(async (req, res) => {
  const { title, content, status, tags } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error("Title and content are required!");
  }

  // Upload image URL from Cloudinary
  const imageUrl = req.file ? req.file.path : null;

  try {
    const newBlog = new Blog({
      title,
      content,
      image: imageUrl, 
      author: req.user._id,
      status: status || "draft",
      tags: tags || [],
    });

    await newBlog.save();
    res.status(201).json({
      message: "Blog post created successfully!",
      blog: newBlog,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to create blog post!");
  }
});

const getAuthorDrafts = asyncHandler(async (req, res) => {
  const drafts = await Blog.find({ author: req.user._id, status: "draft" }).sort({
    updatedAt: -1,
  });

  res.json(drafts);
});

const updateOrPublishBlogPost = asyncHandler(async (req, res) => {
  try {
    const { title, content, status, tags } = req.body; 

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const blogPost = await Blog.findById(req.params.id);

    if (!blogPost) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    // Ensure the current user is the author of the blog post
    if (blogPost.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You are not authorized to update this blog post" });
    }

    blogPost.title = title || blogPost.title;
    blogPost.content = content || blogPost.content;
    blogPost.status = status || blogPost.status;
    blogPost.tags = tags || blogPost.tags;

    const updatedBlogPost = await blogPost.save();

    res.status(200).json({
      message: "Blog post updated successfully!",
      blogPost: updatedBlogPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const deleteBlogPost = asyncHandler(async (req, res) => {
  try {
    const blogPost = await Blog.findById(req.params.id);

    if (!blogPost) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    // Ensure the current user is the author of the blog post
    if (blogPost.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You are not authorized to delete this blog post" });
    }

    await blogPost.deleteOne();

    res.status(200).json({ message: "Blog post deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
const getUserBlogPosts = asyncHandler(async (req, res) => {
  try {
    // Fetch all blog posts for the logged-in user
    const blogPosts = await Blog.find({ author: req.user._id }).select("title _id");

    if (!blogPosts || blogPosts.length === 0) {
      return res.status(404).json({ message: "No blog posts found" });
    }

    res.status(200).json(blogPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});
// Add a Comment or Reply
const addComment = asyncHandler(async (req, res) => {
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


      

const getCommentsForBlog = asyncHandler(async (req, res) => {
  const blogPostId = req.params.blogId;

  // Find all comments for the given blog post
  const comments = await Comment.find({ blogPost: blogPostId })
    .populate("user", "name") 
    .populate({
      path: "replies", 
      populate: { path: "user", select: "name" }, 
    });

  if (!comments || comments.length === 0) {
    return res.status(404).json({ message: "No comments found for this blog post!" });
  }

  res.status(200).json(comments);
});



// Toggle like on a blog post
const toggleLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const blogPost = await Blog.findById(postId);
  if (!blogPost) {
    res.status(404);
    throw new Error("Blog post not found!");
  }

  const likeIndex = blogPost.likes.findIndex(
    (id) => id.toString() === req.user._id.toString()
  );

  if (likeIndex === -1) {
    blogPost.likes.push(req.user._id);
    res.status(200).json({ message: "Blog post liked!" });
  } else {
    blogPost.likes.splice(likeIndex, 1);
    res.status(200).json({ message: "Blog post unliked!" });
  }

  try {
    await blogPost.save();
  } catch (error) {
    res.status(500);
    throw new Error("Failed to toggle like!");
  }
});
// Assumed function in controllers/blogController.js
export const createBlog = async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required.' });
    }
    // Assumes userId is added to req by an auth middleware
    const blog = new Blog({ title, content, author: req.userId });
    await blog.save();
    res.status(201).json(blog);
};

// Bookmark a blog post
const toggleBookmark = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const blogPost = await Blog.findById(postId);
  if (!blogPost) {
    res.status(404);
    throw new Error("Blog post not found!");
  }

  const bookmarkIndex = blogPost.bookmarks.findIndex(
    (id) => id.toString() === req.user._id.toString()
  );

  if (bookmarkIndex === -1) {
    blogPost.bookmarks.push(req.user._id);
    res.status(200).json({ message: "Blog post bookmarked!" });
  } else {
    blogPost.bookmarks.splice(bookmarkIndex, 1);
    res.status(200).json({ message: "Blog post removed from bookmarks!" });
  }

  try {
    await blogPost.save();
  } catch (error) {
    res.status(500);
    throw new Error("Failed to toggle bookmark!");
  }
});

const searchBlogsByTitle = asyncHandler(async (req, res) => {
  const { title } = req.query; 

  if (!title) {
    res.status(400);
    throw new Error("Title is required to search for blogs!");
  }

  // Search for blogs with a matching title (case-insensitive)
  const blogs = await Blog.find({ title: { $regex: title, $options: "i" } }).populate(
    "author", 
    "username name" 
  );

  if (!blogs || blogs.length === 0) {
    res.status(404);
    throw new Error("No blogs found with the given title!");
  }

  // Return the blogs with author details
  res.status(200).json({
    message: "Blogs fetched successfully!",
    blogs: blogs.map((blog) => ({
      id: blog._id,
      title: blog.title,
      content: blog.content,
      tags: blog.tags,
      author: blog.author.username, 
      name: blog.author.name, 
      likes: blog.likes,
      comments: blog.comments.length,
      bookmarks: blog.bookmarks.length,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    })),
  });
});


export { createPost, addComment, getCommentsForBlog, toggleLike, toggleBookmark, searchBlogsByTitle, getAuthorDrafts, updateOrPublishBlogPost, deleteBlogPost, getUserBlogPosts };