export interface IFileService {
    uplodaFile(file: Express.Multer.File, folder: string, userId: string, isPublic?: boolean): Promise<string>;

    deleteFile(key: string): Promise<void>;

    generateSignedUrl(key: string, expiresIn?: number): Promise<string>;

    uploadProfilePicture(
        file: Express.Multer.File,
        userId: string,
    ): Promise<{ key: string; location: string }>;

    uploadResume(file: Express.Multer.File, userId: string): Promise<string>;

    uploadCertificates(file: Express.Multer.File, userId: string): Promise<string>;
}
