import { IUser } from "./user.interface";
import mongoose, { Document, Schema, Model } from "mongoose";
import { userSchema } from "./user.schema";

//User model
export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
