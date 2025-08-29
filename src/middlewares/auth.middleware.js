import { ApiError } from "../utils/Apierror.js";
import { asynchandler } from "../utils/asynchandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"

export const verifyJWT=asynchandler(async(req,resizeBy,next)=>{
    try {
        const token=req.cookies.accesstoken || req.header("Authorization")?.replace("Bearer","")
    
        if(!token){
            throw new ApiError(401,"Unauthorized token")
        }
    
        const decodedtoken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user= await User.findById(decodedtoken?._id).select("-password -refreshToken")
    
        if(!user){
            //todo discuss about frontend
            throw new ApiError(401,"invalid access token")
        }
        req.user=user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message ||"inavlid access token")
    }
})