import { Timestamp } from "mongodb";
import mongoose, { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const CommentSchema = new Schema(
    {
        content: {
            type: String,
            require: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        owner: {
            type: Schema.type.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

CommentSchema.plugin(mongooseAggregatePaginate)
export const Comment = mongoose.model("Comment", CommentSchema)