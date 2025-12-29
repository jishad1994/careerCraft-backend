import s3 from "../../config/aws";
import { S3_BUCKET } from "../../config/aws";
import dotenv from "dotenv";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { IFileService } from "../../services/file-service/interfaces/file.service.interface";
dotenv.config();
export class S3Service implements IFileService {
    async uplodaFile(file: Express.Multer.File, folder: string, userId: string): Promise<string> {
        //user profilePictures folder name since the bucket policy has 'profilePicture' as private prefix
        const key = `${folder}/${userId}/${Date.now()}-${file.originalname}`;

        await s3.send(
            new PutObjectCommand({
                Bucket: S3_BUCKET,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                // ACL: isPublic ? "public-read" : undefined,
            })
        );

        return key; //since the bucket is private by default only the key returns
    }

    async uploadResume(file: Express.Multer.File, userId: string): Promise<string> {
        const key = `resumes/${userId}/${Date.now()}-${file.originalname}`;

        await s3.send(
            new PutObjectCommand({
                Bucket: S3_BUCKET,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                // ACL: "private",
            })
        );

        return key; //since the bucket is private by default only the key returns
    }

    async uploadCertificates(file: Express.Multer.File, userId: string): Promise<string> {
        const key = `certificates/${userId}/${Date.now()}-${file.originalname}`;

        await s3.send(
            new PutObjectCommand({
                Bucket: S3_BUCKET,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                // ACL: "private",
            })
        );

        return key; //since the bucket is private by default only the key returns
    }

    async generateSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        return getSignedUrl(s3, new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }), { expiresIn });
    }

    async deleteFile(key: string): Promise<void> {
        await s3.send(new DeleteObjectCommand({ Key: key, Bucket: S3_BUCKET }));
    }

    async uploadProfilePicture(file: Express.Multer.File, userId: string): Promise<{ key: string; location: string }> {
        const key = `profilePictures/${userId}/${Date.now()}-${file.originalname}`;

        await s3.send(
            new PutObjectCommand({
                Bucket: S3_BUCKET,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                // ACL: "public-read",
            })
        );

        const location = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        return { key, location };
    }

    async uploadBannerImage(file: Express.Multer.File, userId: string): Promise<{ key: string; location: string; }> {
         const key = `bannerImages/${userId}/${Date.now()}-${file.originalname}`;

        await s3.send(
            new PutObjectCommand({
                Bucket: S3_BUCKET,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                // ACL: "public-read",
            })
        );

        const location = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        return { key, location };
    }
}
