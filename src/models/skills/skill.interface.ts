import {  ObjectId,  } from "mongoose";

export interface ISkill  {
    _id:ObjectId
    name: string;
    description?: string;
}
