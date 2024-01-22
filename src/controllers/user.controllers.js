import { response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponce } from "../utils/ApiResponce.js";

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

        //check for image and avatar
        const avatarLocalPath = req.files?.avatar[0]?.path;
        const coverImageLocalPath = req.files?.coverImage[0]?.path

        if (!avatarLocalPath) {
                throw new ApiErrors(400, "Avatar files required")
        }

        //upload them to cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if (!avatar) {
                throw new ApiErrors(400, "Avatar files required")
        }
       //create user object - create entry in DB
        const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase,
        email,
        password
       })

       //remove password and refresh token field from responce
       const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
       )

       //check for user creation
       if(!createUser)
       {
                throw new ApiErrors(500, "Something went wrong while registering the user")
       }

       //return responce
       return res.status(201).json(
                new ApiResponce(200, createUser, "User registered successfully")
       )
})

export {registerUser}