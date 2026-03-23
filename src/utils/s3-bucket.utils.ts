import { S3_BUCKET } from "../config/aws";
import { Readable } from "stream";
const AWS_REGION = process.env.AWS_REGION;

export const getFileLocation = (key: string) => {
    return `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
};

export async function streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}

export function bufferToStream(buffer: Buffer): Readable {
    return Readable.from(buffer);
}



export interface IFileResponse {
    stream: Readable;
    contentType: string;
    contentLength?: number;
    fileName: string;
}
