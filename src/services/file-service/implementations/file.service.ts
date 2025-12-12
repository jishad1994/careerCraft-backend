import { IFileService } from "../interfaces/file.service.interface";

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

    async uploadProfilePicture(file: Express.Multer.File, userId: string): Promise<string> {
        return this.provider.uplodaFile(file, "profilePictures", userId);
    }

    async uploadCertificate(file: Express.Multer.File, userId: string): Promise<string> {
        return this.provider.uplodaFile(file, "certificates", userId);
    }
    async uploadResume(file: Express.Multer.File, userId: string): Promise<string> {
        return this.provider.uplodaFile(file, "certificates", userId);
    }
}
