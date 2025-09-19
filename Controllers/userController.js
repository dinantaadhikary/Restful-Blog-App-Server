import User from "../Models/userModel.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../Middlewares/asyncHandler.js";
import generateToken from "../Utils/createToken.js";
import {cloudinary} from "../Utils/cloudinaryConfig.js";

// Create User Function
const createUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.fields;
    const profilePicture = req.files?.profilePicture;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      profilePicture: profilePicture ? profilePicture.path : null,
    });

    generateToken(res, newUser._id);

    res.status(201).json({
      message: "User created successfully!",
      user: {
        _id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error in createUser:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Login Function for Registered Accounts
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.fields;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (isPasswordValid) {
      generateToken(res, existingUser._id);
      res.status(200).json({
        _id: existingUser._id,
        username: existingUser.username,
        name: existingUser.name,
        email: existingUser.email,
      });
      return;
    } else {
      res.status(401).json({ message: "Invalid Password" });
    }
  } else {
    res.status(404).json({ message: "User not found" });
  }
});
const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      bookmarks: user.bookmarks || [], 
      name: user.name, 
      createdAt: user.createdAt, 
      updatedAt: user.updatedAt, 
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
    try {
      const { email, password } = req.fields;
      const profilePicture = req.files?.profilePicture?.path; 

      // Validation for required fields
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }

      // Find the user by ID
      const user = await User.findById(req.user._id); // Use req.user._id to get the logged-in user

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update fields
      user.username = req.fields.username || user.username;
      user.email = req.fields.email || user.email;

      // Hash new password if provided
      if (req.fields.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.fields.password, salt);
        user.password = hashedPassword;
      }
      if (profilePicture) {
        const uploadResult = await cloudinary.uploader.upload(profilePicture, {
          folder: "user_profiles",
        });
        user.profilePicture = uploadResult.secure_url;
      }

      // Save the updated user document
      const updatedUser = await user.save();

      // Send response with updated user details
      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        bookmarks: updatedUser.bookmarks || [],
        name: updatedUser.name, 
        profilePicture: updatedUser.profilePicture,
        createdAt: updatedUser.createdAt, 
        updatedAt: updatedUser.updatedAt,
      });

    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  });


// User Logout Function
const logoutCurrentUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
});

export { createUser, loginUser, updateCurrentUserProfile,getCurrentUserProfile, logoutCurrentUser };