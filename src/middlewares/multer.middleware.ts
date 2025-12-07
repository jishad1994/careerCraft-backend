import multer from "multer";
import { Request } from "express";

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const imageTypes = ["image/jpeg", "image/png", "image/webp"];
    const pdfTypes = ["application/pdf"];

    if (imageTypes.includes(file.mimetype) || pdfTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only images and PDFs are allowed"));
    }
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
