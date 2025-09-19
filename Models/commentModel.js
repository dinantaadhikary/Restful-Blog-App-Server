import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const commentSchema = new mongoose.Schema(
    {
      text: {
        type: String,
        required: [true, "Comment text is required"],
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null, // Parent comment for replies
      },
      blogPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
        required: true, 
      },
      replies: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Comment", // References nested comments
        },
      ],
    },
    { timestamps: true }
  );
  
  const Comment = mongoose.model("Comment", commentSchema);
  export default Comment;
  