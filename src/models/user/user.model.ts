import { IUser } from "./user.interface";
import mongoose, { Model } from "mongoose";
import { userSchema } from "./user.schema";
import "../../models/skills/skill.model";

//User model
export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
