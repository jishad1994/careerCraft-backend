import dotenv from "dotenv";
dotenv.config();
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middlewares/error.middleware.js";
import { MongooseDatabase } from "./database/mongooseDatabase.js";
import userAuthRoutes from "./routes/user.auth.routes.js";
import companyAuthRoutes from "./routes/company.auth.routes.js";
import commonRoutes from "./routes/common.routes.js";
import { bullMQService, cacheService } from "./dependencies/container.dependency.js";
import adminRoutes from "./routes/admin/admin.routes.js";
import cookieParser from "cookie-parser";

import skillsRoutes from "./routes/skills/skills.routes.js";
import { API_ROUTES } from "./constants/route-contstants/api-routes.constants.js";
import companyRoutes from "./routes/company/company.routes.js";
import publicJobRoutes from "./routes/jobs/jobs.public.routes.js";
import userRoutes from "./routes/user/user.routes.js";
import requestLogger from "./middlewares/requestLogger.middleware.js";
import { notificationRoutes } from "./routes/notification.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import chatRoutes from "./routes/chat.routes.js";

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
app.use(requestLogger);

if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev")); //morgan
}

app.use(helmet()); //helmet

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//db connection

const database = new MongooseDatabase();
async function startApp() {
    await database.connect();
    await cacheService.connect();
    await bullMQService.scheduleRecurring("0 * * * *");
}


startApp();


//cache service connection


//routes
app.use(API_ROUTES.AUTH_USER, userAuthRoutes);
app.use(API_ROUTES.AUTH_COMPANY, companyAuthRoutes);
app.use(API_ROUTES.COMMON_ROUTES, commonRoutes);
app.use(API_ROUTES.WEBHOOK_ROUTE, webhookRoutes);
app.use(API_ROUTES.NOTIFICATIONS, notificationRoutes);
app.use(API_ROUTES.USER, userRoutes);
app.use(API_ROUTES.COMPANY, companyRoutes);
app.use(API_ROUTES.ADMIN, adminRoutes);
app.use(API_ROUTES.SKILLS, skillsRoutes);
app.use(API_ROUTES.JOBS, publicJobRoutes);
app.use(API_ROUTES.CHATS, chatRoutes);

//errro handler middleware
app.use(errorHandler);

export default app;
