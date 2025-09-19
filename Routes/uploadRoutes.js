import multer from "multer";
import { storage } from "../Utils/cloudinaryConfig.js";

const upload = multer({ storage });

export default upload;
