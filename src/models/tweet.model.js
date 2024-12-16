import mongoose, { Schema } from "mongoose";

const Tweet = new Schema(
    {
        content: {
            type: String,
            require: true
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

export const tweet = mongoose.model("tweet", Tweet)