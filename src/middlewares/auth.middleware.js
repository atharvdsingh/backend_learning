import jwt from 'jsonwebtoken'
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncdHandler.js";

const verifyJWT=asyncHandler(async (req,_,next)=>{
    // in Mobiles we check req.header("Authorizationj") may be data come in form of 
    // Authorization : Bearer token
    try {
        const token =  req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ','')
    
        if(!token){
            throw new ApiError(401,'unAuthrized user')
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
        
        if(!user){
            throw new ApiError(401,'Invalid access token')
        }
        req.user=user;
        next()
    } catch (error) {  
        throw new ApiError(401,error?.message || 'invalide access token')
        
    }
    
})
export {verifyJWT}