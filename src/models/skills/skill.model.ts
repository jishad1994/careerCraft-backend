import mongoose, { Schema, Model } from "mongoose";
import { ISkill } from "./skill.interface";

export const skillSchema = new Schema<ISkill>(
    {
        name: { type: String, required: true, unique: true },
        description: String,
    },
    { timestamps: true }
);

export const Skill: Model<ISkill> = mongoose.models.Skill || mongoose.model<ISkill>("Skill", skillSchema);
