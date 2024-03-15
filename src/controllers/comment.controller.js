import mongoose from "mongoose";
import { ApiResponce } from "../utils/ApiResponce";
import { ApiErrors } from "../utils/ApiErrors";
import { asyncHandler } from "../utils/asyncHandler";
import { Comment } from "../models/comment.model";

const getVideoComments = asyncHandler(async(req,res) => {
    
})

export { getVideoComments }