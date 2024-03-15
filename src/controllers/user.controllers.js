import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponce } from "../utils/ApiResponce.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
// import { verify } from "jsonwebtoken";

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

        //         ALGORITHUMS
        // get user details from frontend
        // validation -- not empty
        // check if user already exist -- username and email
        // check for image and avatar
        // upload them to cloudinary
        // create user object - create entry in DB
        // remove password and refresh token field from responce
        // check for user creation
        // return responce

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
       const createUser = await User.findById(user._id).select("-password -refreshToken")

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
        if(!email && !username)
        {
                throw new ApiErrors(400, "username or password is required");
        }

        //find the user
        const user = await User.findOne({
                $or: [{email}, {username}]
            });
            
            if (!user) {
                throw new ApiErrors(404, "User does not exist");
            }
            

        //password check
        const isPasswordValid = await user.isPasswordCorrect(password);

        if(!isPasswordValid)
        {
                throw new ApiErrors(401, "Invalid User Credentials");
        }

        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

        //isse password or refreshToken ka data user ke paas nhi jaiga
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

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
                        $unset: {
                                refreshToken: 1
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

const refreshAccessToken = asyncHandler(async (req, res) => {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
        if (!incomingRefreshToken) {
            throw new ApiErrors(401, "Unauthorized access");
        }
    
        try {
            const jwt = require('jsonwebtoken'); // Import jwt here if not already imported
            const decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            );
    
            const user = await User.findById(decodedToken?._id);
            if (!user) {
                throw new ApiErrors(401, "Invalid Refresh token");
            }
    
            if (incomingRefreshToken !== user?.refreshToken) {
                throw new ApiErrors(401, "Refresh token is invalid or expired");
            }
    
            const options = {
                httpOnly: true,
                secure: true
            };
    
            const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);
    
            res.status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", newRefreshToken, options)
                .json(
                    new ApiResponce(200, { accessToken, newRefreshToken }, "Access token refreshed successfully")
                );
        } catch (error) {
            throw new ApiErrors(401, error?.message || "Invalid refresh token");
        }
    });

const changeCurrentPassword = asyncHandler(async(req,res) => {
        const{oldPassword, currentPassword} = req.body

        const user = await User.findById(req.user?._id)
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

        if(!isPasswordCorrect){
                throw new ApiErrors(400, "Invalid Old Password")
        }

        user.password = newPassword
        await user.save({ValidateBeforeSave: false})

        return res.status(200)
        .json(new ApiResponce(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async(req,res) => {
        return res.status(200)
        .json(new ApiResponce(200, req.user, "Current user fetched successfully"))
});

const updateAccountDetails = asyncHandler(async(req, res) =>{
        const{fullName,email} = req.body

        if(!fullName || !email){
                throw new ApiErrors(400, "All fields are required")
        }

        const user = await User.findByIdAndUpdate(req.user?._id,
                {
                        $set: {
                                fullName: fullName,
                                email: email
                        }
                },
                {
                        new: true
                }
                ).select("-password")

                return res.status(200)
                .json(new ApiResponce(200, user, "Account details updatedd successfully"))
});

const updateUserAvatar = asyncHandler(async(req,res) => {
        const avatarLocalPath = req.file?.path

        if(!avatarLocalPath){
                throw ApiErrors(400, "Avatar file is missing")
        }

        //upload on clouinary
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        //if we don't get clouinary link
        if(!avatar.url){
                throw new ApiErrors(400, "Error while uploading on avatar")
        }

        //Avatar update
        const user = await User.findByIdAndUpdate(req.user?._id,
                {
                        $set:{
                                avatar: avatar.url
                        }
                },
                {new: true}
                )
        .select("-password")

        return res.status(200)
        .json(new ApiResponce(400, user, "Avatar updated successfully"))
});

const updateAccountCoverImage = asyncHandler(async(req, res) => {
        const CoverImageLocalPath = req.file?.path

        if(!CoverImageLocalPath){
                throw ApiErrors(400, "Cover Image file is missing")
        }

        //upload on clouinary
        const CoverImage = await uploadOnCloudinary(CoverImageLocalPath)
        //if we don't get clouinary link
        if(!CoverImage.url){
                throw new ApiErrors(400, "Error while uploading CoverImage")
        }

        //Avatar update
        const user = await User.findByIdAndUpdate(req.user?._id,
                {
                        $set:{
                                avatar: CoverImage.url
                        }
                },
                {new: true}
                )
        .select("-password")

        return res.status(200)
        .json(new ApiResponce(400, user, "Cover Image updated successfully"))
}); 

        //pipeline

const getUserChannelDetails = asyncHandler(async(req, res) => {
        //first take user
        const {username} = req.params
        //what if user doesn't exist
        if (!username?.trim()) {
                throw new ApiErrors(400, "username is missing")
        }
        //implimenting pipeline for fetching user details

        const channel = await User.aggregate([
                {
                        $match: {
                                username: username?.toLowerCase()
                        }
                },
                //first pipeline to get subscribers count
                {
                        $lookup: {
                                from: "subscriptions",
                                localField: "_id",
                                foreignField: "channel",
                                as: "subscriber"
                        }
                },
                //humne kitno ne subscribe kie hai?
                {
                        $lookup: {
                                from: "subscriptions",
                                localField: "_id",
                                foreignField: "subscriber",
                                as: "subscribedTo"
                        }
                }, 
                {
                        $addFields: {
                                subscribersCount: {
                                        $size: "subscribers"
                                },
                                channelsSubscribedToCount: {
                                        $size: "subscribedTo"
                                },
                                isSubscribed: {
                                        $cond: {
                                                if: {$in: [req.user?._id, "$subscribers.Subscriber"]},
                                                then: true,
                                                else: false
                                        }
                                }
                        }
                },
                {
                        $project: {
                                fullName: 1,
                                username: 1,
                                avatar: 1,
                                coverImage: 1,
                                email: 1,
                                subscribersCount: 1,
                                channelsSubscribedToCount: 1,
                                isSubscribed: 1
                        }
                }
        ])

        if (!channel?.length) {
                throw new ApiErrors(404, "channel does not exist")
        }

        return res.status(200)
        .json(new ApiResponce(200, channel[0], "User channel fetched successfully"))
});

const getWatchHistory = asyncHandler(async(req, res) => {
        const user = await User.aggregate([
                //get into user's place
                {
                        $match: {
                                _id: new mongoose.Types.ObjectId(req.user._id)
                        }
                },
                //now going into watch History
                {
                        $lookup: {
                                from: "video",
                                localField: "watchHistory",
                                foreignField: "_id",
                                as: "watchHistory",
                                //implementing sub pipeline for getting info of owner details, therefore doing nested pipeline
                                pipeline: [
                                        {
                                                $lookup: {
                                                        from: "video",
                                                        localField: "owner",
                                                        foreignField: "_id",
                                                        as: "owner",
                                                        pipeline: [
                                                                {
                                                                        $project: {
                                                                                fullName: 1,
                                                                                username: 1,
                                                                                avatar: 1
                                                                        }
                                                                }
                                                        ]
                                                }
                                        },
                                        {
                                                $addFields: {
                                                        owner: {
                                                                $first: "$owner"
                                                        }
                                                }
                                        }
                                ]
                        }
                }, 
        ])

        return res.status(200)
        .json(new ApiResponce(200, user[0].watchHistory,"watch history fetched successfully"))
});

export { 
        registerUser,
        loginUser,
        logOutUser,
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentUser,
        updateAccountDetails,
        updateUserAvatar,
        updateAccountCoverImage,
        getUserChannelDetails,
        getWatchHistory
}