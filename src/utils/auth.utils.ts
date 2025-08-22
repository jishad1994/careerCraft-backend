import rateLimiter from "express-rate-limit";

export const OTPlimiter = rateLimiter({
    windowMs: 60 * 1000, //one minute
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: "Too many requests, please try again later.",
    },
});
