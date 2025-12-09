import { Document, ObjectId } from "mongoose";

export interface ISkill extends Document {
    _id: ObjectId;
    name: string;
    description?: string;
    blocked: boolean;
}
