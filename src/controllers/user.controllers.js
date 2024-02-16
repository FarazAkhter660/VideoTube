import { response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponce } from "../utils/ApiResponce.js";

const generateAccessAndRefreshToken = async(userId) => {
        try {
                const user = await User.findById(userId)
                const accessToken = generateAccessToken()
                const refreshToken = generateRefreshToken()

                user.refreshToken = refreshToken
                await user.save({ValidateBeforeSave: false})

                return{accessToken, refreshToken}

        } catch (error) {
                throw new ApiErrors(500, "Something Went wrong while generating refresh and access token")
        }
}

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

const registerUser = asyncHandler(async (req,res) => {
                

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
        const existedUser = await User.findOne({
                $or: [{ email }, { username }]
        })
        if(existedUser) {
                throw new ApiErrors(409, "User with email or username already exists")
        }
        //  console.log(req.files);

        //check for image and avatar
        const avatarLocalPath = req.files?.avatar[0]?.path;
        //const coverImageLocalPath = req.files?.coverImage[0]?.path

        let coverImageLocalPath;
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
        {
                coverImageLocalPath = req.files.coverImage[0].path
        }

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
//ALGORITHUMS
// req body se data le aao
// username or email
//find the user
//password check
//access and referesh token
//send cookie
const loginUser = asyncHandler(async(req,res) => {
        // req body se data le aao
        const{username, email, password} = req.body

        // username or email
        if(!email || !username)
        {
                throw new ApiErrors(400, "username or password is required")
        }

        //find the user
        const user = User.findOne({
                $or: [{email}, {username}]
        })

        if(!user)
        {
                throw new ApiErrors(404, "user does not exist")
        }

        //password check
        const isPasswordValid = await user.isPasswordCorrect(password)

        if(!isPasswordValid)
        {
                throw new ApiErrors(401, "Invalid User Credentials")
        }

        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

        //isse password or refreshToken ka data user ke paas nhi jaiga
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

        //send cookie
        const options = {
                httpOnly: true,
                secure: true
        }

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
                new ApiResponce(
                        200,
                        {
                                user: loggedInUser, accessToken, refreshToken
                        },
                        "User logged in successfully"
                )
        )
})

const logOutUser = asyncHandler(async(req,res) => {
        await User.findByIdAndUpdate(
                req.user._id,
                {
                        $set: {
                                accessToken: undefined
                        }
                },
                {
                        new: true
                }
        )

        const options = {
                httpOnly: true,
                secure: true
        }

        return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponce(200, {}, "User logged out"))
})
export { 
        registerUser,
        loginUser,
        logOutUser 
}