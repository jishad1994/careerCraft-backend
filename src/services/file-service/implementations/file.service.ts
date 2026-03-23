import dotenv from "dotenv";
dotenv.config();
import { IFileService } from "../interfaces/file.service.interface";
import { S3_BUCKET } from "../../../config/aws";
import { AppError } from "../../../errors-classes/app.error.";
import logger from "../../../utils/logger";
import { GetObjectCommandOutput } from "@aws-sdk/client-s3";

export class FileService implements IFileService {
    constructor(private readonly provider: IFileService) {}

    async uplodaFile(file: Express.Multer.File, folder: string, userId: string, isPublic?: boolean): Promise<string> {
        try {
            return this.provider.uplodaFile(file, folder, userId, isPublic);
        } catch (error) {
            logger.error(error);
            throw new AppError("Error while uploading file",400);
        }
    }

    async uploadBuffer(buffer: Buffer, folder: string, fileName: string, contentType: string): Promise<string> {
        try {
            return this.provider.uploadBuffer(buffer, folder, fileName, contentType);
        } catch (error) {
            logger.error(error);
            throw new AppError("Error while uploading buffer",400);
        }
    }


    async deleteFile(key: string): Promise<void> {
        return this.provider.deleteFile(key);
    }

    async generateSignedUrl(key: string, expiresIn?: number): Promise<string> {
        return this.provider.generateSignedUrl(key, expiresIn);
    }

    async uploadProfilePicture(file: Express.Multer.File, userId: string): Promise<{ key: string; location: string }> {
        console.log("uploading profile picture");

        const key: string = await this.provider.uplodaFile(file, "profilePictures", userId, true);

        const location = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        return { key, location };
    }

    async uploadBannerImage(file: Express.Multer.File, userId: string): Promise<{ key: string; location: string }> {
        const key: string = await this.provider.uplodaFile(file, "bannerImages", userId, true);

        const location = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        return { key, location };
    }

    async uploadCertificates(file: Express.Multer.File, userId: string): Promise<string> {
        return this.provider.uplodaFile(file, "certificates", userId);
    }

    async uploadResume(file: Express.Multer.File, userId: string): Promise<string> {
        return this.provider.uplodaFile(file, "resumes", userId);
    }

    async getFile(key: string): Promise<GetObjectCommandOutput> {
        return await this.provider.getFile(key);
    }
}
