import { asynchandler } from "../utils/asynchandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { getFilePath } from "../middlewares/multer.middleware.js"; // helper to get local file paths

const registeruser = asynchandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  // Validate fields
  if ([fullname, email, password, username].some(f => !f || f.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user exists
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "Email or username already exists");
  }

  // Get local file paths from multer
  const avatarLocalPath = getFilePath(req.files?.avatar?.[0]);
  const coverLocalPath = getFilePath(req.files?.coverImage?.[0]);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Create user with local file paths
  const user = await User.create({
    fullname,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatarLocalPath,
    coverImage: coverLocalPath || ""
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(201)
    .json(new Apiresponse(200, createdUser, "User registered successfully"));
});

export { registeruser };
