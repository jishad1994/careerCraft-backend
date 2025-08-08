import dotenv from "dotenv";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middlewares/error.middleware";
import { connectDB } from "./config/db";
import { MongooseDatabase } from "./database/mongooseDatabase";
import userRoutes from "./routes/user.routes";
dotenv.config();
const app: Application = express();

const port = process.env.PORT || 3000;
app.use(cors({ origin: process.env.FRONTEND_URL, methods: "*", credentials: true }));
app.use(express.json());

//routes
app.use(errorHandler); //errro handler middleware
app.use("/api/user", userRoutes);
// app.use("/api/company", companyRoutes);
// app.use("/api/admin", adminRoutes);

app.use(helmet());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

//db connection
const database = new MongooseDatabase();
database.connect();

app.listen(port, () => {
    console.log(`server running on ${port} `);
});
