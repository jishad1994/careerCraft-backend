import { GetObjectCommandOutput } from "@aws-sdk/client-s3";

export interface IFileService {
    uplodaFile(file: Express.Multer.File, folder: string, userId: string, isPublic?: boolean): Promise<string>;

    uploadBuffer(buffer: Buffer, folder: string, fileName: string, contentType: string): Promise<string> 

    deleteFile(key: string): Promise<void>;

    generateSignedUrl(key: string, expiresIn?: number): Promise<string>;

    getFile(key: string): Promise<GetObjectCommandOutput>;

    uploadProfilePicture(file: Express.Multer.File, userId: string): Promise<{ key: string; location: string }>;
    
    uploadBannerImage(file: Express.Multer.File, userId: string): Promise<{ key: string; location: string }>;

    uploadResume(file: Express.Multer.File, userId: string): Promise<string>;

    uploadCertificates(file: Express.Multer.File, userId: string): Promise<string>;
}
