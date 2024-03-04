import mongoose, { Schema } from "mongoose";

const PlayListSchema = new Schema(
    {
        name: {
            require: true,
            type: String
        },
        description: {
                type: String,
                require: true
        },
        video: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

export const playlist = mongoose.model("playlist", PlayListSchema)