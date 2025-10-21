import mongoose from "mongoose";
import { IDatabase } from "./database.interface";

export class MongooseDatabase implements IDatabase {
    async connect(): Promise<void> {
        try {
            await mongoose.connect(process.env.MONGO_URI || "");
            console.log('database connected secure')
        } catch (error) {
            if (error instanceof Error) {
                console.log("DB connection Error: ", error.message);
            } else {
                console.log("unknown error: ", error);
            }
        }
    }

    async disconnect(): Promise<void> {
        await mongoose.disconnect();

        console.log("mongoDB disconnected");
    }
}
