import mongoose from "mongoose";
import { IDatabase } from "./database.interface.js";
import logger from "../utils/logger.js";

export class MongooseDatabase implements IDatabase {
    async connect(): Promise<void> {
        try {
            await mongoose.connect(process.env.MONGO_URI || "");
        } catch (error) {
            if (error instanceof Error) {
                logger.error("DB connection Error: ", error.message);
            } else {
                logger.error("unknown error: ", error);
            }
        }
    }

    async disconnect(): Promise<void> {
        await mongoose.disconnect();

        logger.info("mongoDB disconnected");
    }
}
