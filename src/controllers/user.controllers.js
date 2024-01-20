import { response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js"
import { User } from "../models/user.model.js"

const registerUser = asyncHandler(async (req,res) => {
                //ALGORITHUMS
        //get user details from frontend
        //validation -- not empty
        //check if user already exist -- username and email
        //check for image and avatar
        //upload them to cloudinary
        //create user object - create entry in DB
        //remove password and refresh token field from responce
        //check for user creation
        //return responce

        //get user details from frontend
        const{email,password,username,fullName} = req.body
        console.log("email :", email);

         //validation -- not empty
        if ([fullName,email,password,username].some((field) =>
        field?.trim() === "")
           ) 
        {
                throw new ApiErrors(400, "All fields are required")
        }

        //check if user already exist -- username and email

        const existedUser = User.findOne({
                $or: [{ email }, { username }]
        })
        if(existedUser) {
                throw new ApiErrors(409, "User with email or username already exists")
        }
})

export {registerUser}