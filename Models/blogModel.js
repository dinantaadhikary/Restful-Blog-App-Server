import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;
// Blog Schema
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    image: {
      type: String,
      // required: true
  },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft", 
    },
    
    tags: {
      type: [String],
      default: [],
    },
    likes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
      default: [],
    },
    bookmarks: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
      default: [],
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ], 
  },
  {
    timestamps: true, 
  }
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
