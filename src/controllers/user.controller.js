import { asynchandler } from "../utils/asynchandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken"

// Generate access + refresh tokens
const generateAccessAndRefresh = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accesstoken = user.generateaccesstoken();   // ✅ call methods
    const refreshToken = user.generateRefreshtoken();

    user.refreshtoken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accesstoken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error while generating refresh token");
  }
};

// Register user
const registeruser = asynchandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  // Validate fields
  if ([fullname, email, username, password].some(f => !f || f.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user exists
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "Email or username already exists");
  }

  // Create user (no file uploads)
  const user = await User.create({
    fullname,
    email,
    username: username.toLowerCase(),
    password,
    avatar: "",       // optional default
    coverImage: ""    // optional default
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(201)
    .json(new Apiresponse(200, createdUser, "User registered successfully"));
});

// Login user
const loginuser = asynchandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Require username OR email + password
  if ((!username && !email) || !password) {
    throw new ApiError(400, "Username or email and password are required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (!user) {
    throw new ApiError(404, "No user found with given credentials");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accesstoken, refreshToken } = await generateAccessAndRefresh(user._id);

  const loggedinuser = await User.findById(user._id).select("-password -refreshToken");

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .cookie("accesstoken", accesstoken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new Apiresponse(
        200,
        { user: loggedinuser, accesstoken, refreshToken },
        "User logged in successfully"
      )
    );
});

// Logout user
const loggedoutuser = asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  const cookieOptions = { httpOnly: true, secure: true };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new Apiresponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asynchandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(400, "Unauthorized access");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decodedToken?.id);
  if (!user) {
    throw new ApiError(401, "Invalid token");
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh token has expired");
  }

  const { accesstoken, refreshToken } = await generateAccessAndRefresh(user._id);

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .cookie("accesstoken", accesstoken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new Apiresponse(
        200,
        { accesstoken, refreshToken },
        "Access token refreshed"
      )
    );
});


export { registeruser, loginuser, loggedoutuser,refreshAccessToken  };
