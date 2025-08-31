import { asynchandler } from "../utils/asynchandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken";

// Generate access + refresh tokens
const generateAccessAndRefresh = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error while generating refresh token");
  }
};

// Register user
const registeruser = asynchandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  if ([fullname, email, username, password].some((f) => !f || f.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "Email or username already exists");
  }

  const user = await User.create({
    fullname,
    email,
    username: username.toLowerCase(),
    password,
    avatar: "",
    coverImage: "",
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(201)
    .json(new Apiresponse(201, createdUser, "User registered successfully"));
});

// Login user
const loginuser = asynchandler(async (req, res) => {
  const { username, email, password } = req.body;

  if ((!username && !email) || !password) {
    throw new ApiError(400, "Username or email and password are required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "No user found with given credentials");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefresh(user._id);

  const loggedinuser = await User.findById(user._id).select("-password -refreshToken");

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new Apiresponse(
        200,
        { user: loggedinuser, accessToken, refreshToken },
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

// Refresh access token
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

  const user = await User.findById(decodedToken?._id);
  if (!user) {
    throw new ApiError(401, "Invalid token");
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh token has expired");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefresh(user._id);

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new Apiresponse(
        200,
        { accessToken, refreshToken },
        "Access token refreshed successfully"
      )
    );
});

// Change password
const changecurrentpassword = asynchandler(async (req, res) => {
  const { oldpassword, newpassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldpassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid old password");
  }

  user.password = newpassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new Apiresponse(200, {}, "Password changed successfully"));
});

// Get current user
const getcurrentuser = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(new Apiresponse(200, req.user, "Current user fetched successfully"));
});

// Update account details
const updatedAccountdetail = asynchandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { fullname, email } },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new Apiresponse(200, user, "Account details updated successfully"));
});

// Update Avatar
const updateUserAvatar = asynchandler(async (req, res) => {
  const avatarlocalpath = req.file?.path;

  if (!avatarlocalpath) {
    throw new ApiError(400, "No avatar file uploaded");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avatarlocalpath } },
    { new: true }
  );

  return res
    .status(200)
    .json(new Apiresponse(200, { avatar: user.avatar }, "Avatar updated successfully"));
});

// Update Cover Image
const updateUserCoverImage = asynchandler(async (req, res) => {
  const coverlocalpath = req.file?.path;

  if (!coverlocalpath) {
    throw new ApiError(400, "No cover image uploaded");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { coverImage: coverlocalpath } },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new Apiresponse(200, { coverImage: user.coverImage }, "Cover image updated successfully")
    );
});

export {
  registeruser,
  loginuser,
  loggedoutuser,
  refreshAccessToken,
  changecurrentpassword,
  getcurrentuser,
  updatedAccountdetail,
  updateUserAvatar,
  updateUserCoverImage,
};
