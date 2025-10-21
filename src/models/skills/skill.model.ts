import mongoose, { Schema, Model } from "mongoose";
import { ISkills } from "./skill.interface";

export const skillSchema = new Schema<ISkills>({
    name: { type: String, required: true, unique: true },
    description: String,
});
export const Skill: Model<ISkills> = mongoose.models.Skill || mongoose.model<ISkills>("Skill", skillSchema);
