import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const LikedBy = new Schema(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        likedBy: {
            type: Schema.type.ObjectId,
            ref: "User"
        },
        tweet: {
            type: Schema.type.ObjectId,
            ref: "tweet"
        }
    },
    {
        timestamps: true
    }
)

export const Like = mongoose.model("LikedBy", LikedBy)