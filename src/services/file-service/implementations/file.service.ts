import dotenv from "dotenv";
dotenv.config();
import { IFileService } from "../interfaces/file.service.interface";
import { S3_BUCKET } from "../../../config/aws";

export class FileService implements IFileService {
    constructor(private readonly provider: IFileService) {}

    async uplodaFile(file: Express.Multer.File, folder: string, userId: string, isPublic?: boolean): Promise<string> {
        return this.provider.uplodaFile(file, folder, userId, isPublic);
    }

    async deleteFile(key: string): Promise<void> {
        return this.provider.deleteFile(key);
    }

    async generateSignedUrl(key: string, expiresIn?: number): Promise<string> {
        return this.provider.generateSignedUrl(key, expiresIn);
    }

    async uploadProfilePicture(file: Express.Multer.File, userId: string): Promise<{ key: string; location: string }> {

        const key: string = await this.provider.uplodaFile(file, "profilePictures", userId, true);

        const location = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        return { key, location };
    }
    

    async uploadBannerImage(file: Express.Multer.File, userId: string): Promise<{ key: string; location: string; }> {
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
}
