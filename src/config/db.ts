import mongoose from "mongoose";

export const connectDB = async function () {
    try {
        await mongoose.connect(process.env.MONGO_URI || "");
        console.log("database connected");
    } catch (error) {
        console.log(`db connection failed due to error:${error}`);
    }
};