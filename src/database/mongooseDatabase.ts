import mongoose from "mongoose";
import { IDatabase } from "./database.interface";

export class MongooseDatabase implements IDatabase {
    async connect(): Promise<void> {
        await mongoose.connect(process.env.MONGO_URI || "");
        console.log("mongoDB  connected ");
    }

    async disconnect(): Promise<void> {
        await mongoose.disconnect();

        console.log("mongoDB disconnected");
    }
}
