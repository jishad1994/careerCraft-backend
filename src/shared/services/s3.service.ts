import { IFileService } from "../../services/file-service/interfaces/file.service.interface";
import s3 from "../../config/aws";
import { S3_BUCKET } from "../../config/aws";
import dotenv from "dotenv";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
dotenv.config();
export class S3Service implements IFileService {
    async uplodaFile(
        file: Express.Multer.File,
        folder: string,
        userId: string,
        isPublic: boolean = false
    ): Promise<string> {
        //user profilePictures folder name since the bucket policy has 'profilePicture' as private prefix
        const key = `${folder}/${userId}/${Date.now()}-${file.originalname}`;

        await s3.send(
            new PutObjectCommand({
                Bucket: S3_BUCKET,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: isPublic ? "public-read" : undefined,
            })
        );

        return key; //since the bucket is private by default only the key returns
    }

    async generateSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        return getSignedUrl(s3, new PutObjectCommand({ Bucket: S3_BUCKET, Key: key }), { expiresIn });
    }

    async deleteFile(key: string): Promise<void> {
        await s3.send(new DeleteObjectCommand({ Key: key, Bucket: S3_BUCKET }));
    }
}
