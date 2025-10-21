import { createLogger, format, transports } from "winston";

const devFormat = format.combine(
    format.colorize(),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ level, message, timestamp }) => {
        return `[${timestamp}] ${level}:${message}`;
    })
);

const prodFormat = format.combine(format.timestamp(), format.json());

const logger = createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
    transports: [
        new transports.Console(),
        new transports.File({ filename: "logs/error.log", level: "error" }),
        new transports.File({ filename: "logs/combined.log" }),
    ],
});

export default logger;
