import mongoose, {Schema} from "mongoose";
import Jwt from "jsonwebtoken";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import bcrypt from "bcrypt";

const videoSchema = new Schema(
    {
        videoFile: {
            require: true,
            type: String
        },
        thumbnail: {
            require: true,
            type: String
        },
        title: {
            require: true,
            type: String
        },
        duration: {
            require: true,
            type: Number
        },
        discription: {
            require: true,
            type: String
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: trusted
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const video = mongoose.model("Video", videoSchema)