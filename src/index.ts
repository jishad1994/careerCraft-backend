import dotenv from "dotenv";
dotenv.config();
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middlewares/error.middleware";
import { MongooseDatabase } from "./database/mongooseDatabase";
import userRoutes from "./routes/user/user.profile.routes";
import userAuthRoutes from "./routes/user.auth.routes";
import companyAuthRoutes from "./routes/company.auth.routes";
import commonRoutes from "./routes/common.routes";
import { cacheService } from "./dependencies/container.dependency";
import adminRoutes from "./routes/admin.routes";
import cookieParser from "cookie-parser";
import logger from "./utils/logger";
import companyRoutes from "./routes/company/company.profile.routes";
import skillsRoutes from "./routes/skills/skills.routes";

const app: Application = express();

const port = process.env.PORT || 3000;

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        credentials: true,
        optionsSuccessStatus:200
    })
); //cors
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev")); //morgan
}

app.use(helmet()); //helmet

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//db connection

const database = new MongooseDatabase();
await database.connect();

//cache service connection
await cacheService
    .connect()
    .then(() => logger.info("cache service connected"))
    .catch((err) => {
        if (err) {
            logger.error("cache error", err.message);
        }
    });

//routes
app.use("/api/auth/user", userAuthRoutes);
app.use("/api/auth/company", companyAuthRoutes);
app.use("/api/auth", commonRoutes);
app.use("/api/user", userRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/skills", skillsRoutes);

//errro handler middleware
app.use(errorHandler);

app.listen(port, () => {
    logger.info(`server running on ${port} `);
});
