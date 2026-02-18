import { Schema } from "mongoose";
import { IBannerImage, IProfilePicture } from "../user/user.interface";

export const bannerImageSchema = new Schema<IBannerImage>(
    {
        key: { type: String, required: true },
        location: { type: String, required: true },
    },
    { _id: false },
);


export const profilePictureSchema = new Schema<IProfilePicture>(
    {
        key: { type: String, required: true },
        location: { type: String, required: true },
    },
    { _id: false },
);
