import { asynchandler } from "../utils/asynchandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { getFilePath } from "../middlewares/multer.middleware.js"; // helper to get local file paths

const generateAccessAndRefresh=async(userId)=>
  {
  try {
    const user = await User.findById(userId)
    const accesstoken=user.generateaccesstoken
    const refreshToken=user.generateRefreshtoken

    user.refreshtoken=refreshToken
    user.save({validateBeforeSave:false})

    return {accesstoken,refreshToken}
  } catch (error) {
    throw new ApiError(500, "my mistake while generating refresh token")
  }
 
}


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



const loginuser=asynchandler(async(req,res)=>{
    //req body
    //username or email // phone//
    //find user
    //check validate
    //access and refresh token
    //send cookies



    const {username,email,password}=req.body
    if(!username || !email){
      throw new ApiError(400,"atleast one field is require")
    }

   const user=await User.findOne({
      $or:[{email},{username}]
    })

    if(!user){
      throw new ApiError(404,"No user is found")
    }
    const ispasswordvalid=await user.isPasswordCorrect(password)

    if(!ispasswordvalid){
      throw new ApiError(401,"Your credential is wrong")
    }
    const {accesstoken,refreshToken} =await generateAccessAndRefresh(user_id)

   const loggedinuser= User.findById(user_id).select("-password -refreshToken")

   const options={
      httpOnly:true,
      secure:true
   }
   return res.status(200).cookie("accesstoken",accesstoken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
      new Apiresponse(
        200,
        {
          user:loggedinuser,accesstoken,refreshToken
        },
        "user log in successfully"
      )
   )

})

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

export { registeruser,
      loginuser,
      loggedoutuser
 };
