import { Document, ObjectId,  } from "mongoose";

export interface ISkills extends Document {
    _id:ObjectId
    name: string;
    description?: string;
}
