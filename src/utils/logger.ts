import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const devFormat = format.combine(
    format.colorize(),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ level, message, timestamp }) => {
        return `[${timestamp}] ${level}: ${message}`;
    }),
);

const prodFormat = format.combine(format.timestamp(), format.json());

const errorFileTransport = new DailyRotateFile({
    filename: "logs/error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    level: "error",
    maxSize: "20m",
    maxFiles: "14d",
    zippedArchive: true,
});

const combinedFileTransport = new DailyRotateFile({
    filename: "logs/combined-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "14d",
    zippedArchive: true,
});

const logger = createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
    transports: [new transports.Console(), errorFileTransport, combinedFileTransport],
});

export default logger;
