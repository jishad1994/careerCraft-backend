import mongoose, { Document,} from "mongoose";

export interface ISkill extends Document<mongoose.Types.ObjectId> {
    name: string;
    description?: string;
    blocked: boolean;
}
