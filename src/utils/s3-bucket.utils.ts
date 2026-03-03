import { S3_BUCKET } from "../config/aws";

const AWS_REGION = process.env.AWS_REGION;

export const getFileLocation = (key: string) => {
    return `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
};
