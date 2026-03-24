import dotenv from "dotenv";
dotenv.config();
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middlewares/error.middleware";
import { MongooseDatabase } from "./database/mongooseDatabase";
import userAuthRoutes from "./routes/user.auth.routes";
import companyAuthRoutes from "./routes/company.auth.routes";
import commonRoutes from "./routes/common.routes";
import { cacheService } from "./dependencies/container.dependency";
import adminRoutes from "./routes/admin/admin.routes";
import cookieParser from "cookie-parser";
import logger from "./utils/logger";

import skillsRoutes from "./routes/skills/skills.routes";
import { API_ROUTES } from "./constants/route-contstants/api-routes.constants";
import companyRoutes from "./routes/company/company.routes";
import publicJobRoutes from "./routes/jobs/jobs.public.routes";
import userRoutes from "./routes/user/user.routes";
import requestLogger from "./middlewares/requestLogger.middleware";
import { notificationRoutes } from "./routes/notification.routes";
import { notificationAuthMiddleware } from "./middlewares/notification-auth.middlware";
import webhookRoutes from "./routes/webhook.routes";
import { commonAuthMiddleware } from "./middlewares/common.auth.middleware";
import chatRoutes from "./routes/chat.routes";

const app: Application = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        credentials: true,
        
        optionsSuccessStatus: 200,

    }),
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

app.use(requestLogger);

//routes
app.use(API_ROUTES.AUTH_USER, userAuthRoutes);
app.use(API_ROUTES.AUTH_COMPANY, companyAuthRoutes);
app.use(API_ROUTES.COMMON_ROUTES, commonRoutes);
app.use(API_ROUTES.WEBHOOK_ROUTE, webhookRoutes);
app.use(API_ROUTES.NOTIFICATIONS, notificationAuthMiddleware, notificationRoutes);
app.use(API_ROUTES.USER, userRoutes);
app.use(API_ROUTES.COMPANY, companyRoutes);
app.use(API_ROUTES.ADMIN, adminRoutes);
app.use(API_ROUTES.SKILLS, skillsRoutes);
app.use(API_ROUTES.JOBS, publicJobRoutes);
app.use(API_ROUTES.CHATS, chatRoutes);

//errro handler middleware
app.use(errorHandler);

export default app;
