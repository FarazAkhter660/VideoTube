import { User } from "../models/user.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
    
        console.log(token)
        if (!token) {
            throw new ApiErrors(401, "Unauthorized request")
        }
    
        const decodedToken = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        
        if(!User)
        {
            throw new ApiErrors(401, "Invalid Access Token")
        }
        
        req.user = user;
        next()
    } catch (error) {
        throw new ApiErrors(401, error?.message || "Invalid Access Token")
    }
})