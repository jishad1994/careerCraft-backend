import dotenv from "dotenv";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middlewares/error.middleware";
import { MongooseDatabase } from "./database/mongooseDatabase";
import userRoutes from "./routes/user.routes";
import userAuthRoutes from "./routes/userAuth.routes";
import { cacheService } from "./dependencies/container.dependency";

dotenv.config();
const app: Application = express();

const port = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL, methods: "*", credentials: true })); //cors

if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev")); //morgan
}

app.use(helmet()); //helmet

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//db connection
const database = new MongooseDatabase();
database.connect();

//cacche service connection
await cacheService
    .connect()
    .then(() => console.log("cache service connected"))
    .catch((err) => {
        if (err) {
            console.log("cache error", err.message);
        }
    });

//routes
app.use("/api/auth/user", userAuthRoutes);
app.use("/api/user", userRoutes);
// app.use("/api/company", companyRoutes);
// app.use("/api/admin", adminRoutes);

//errro handler middleware
app.use(errorHandler);

app.listen(port, () => {
    console.log(`server running on ${port} `);
});
