import {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
    HeadObjectCommand,
    ObjectCannedACL,
} from "@aws-sdk/client-s3";
import { env } from "./env";

const s3Client = new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: env.S3_SECRET_ACCESS_KEY || "",
    },
    forcePathStyle: env.S3_FORCE_PATH_STYLE, // Important for S3 compatible services
});

export async function uploadFile(
    key: string,
    body: Buffer | string,
    contentType: string = "application/octet-stream",
    acl: ObjectCannedACL = "private",
): Promise<void> {
    try {
        const command = new PutObjectCommand({
            Bucket: env.S3_BUCKET,
            Key: key,
            Body: body,
            ContentType: contentType,
            ACL: acl,
        });

        await s3Client.send(command);
    }
    catch (error) {
        console.error("S3 upload error:", error);
        throw new Error(`Failed to upload file to S3: ${error}`);
    }
}

export async function downloadFile(key: string): Promise<Buffer> {
    try {
        const command = new GetObjectCommand({
            Bucket: env.S3_BUCKET,
            Key: key,
        });

        const response = await s3Client.send(command);
        const chunks: Uint8Array[] = [];

        if (response.Body) {
            const reader = response.Body as AsyncIterable<Uint8Array>;
            for await (const chunk of reader) {
                chunks.push(chunk);
            }
        }

        return Buffer.concat(chunks);
    }
    catch (error) {
        console.error("S3 download error:", error);
        throw new Error(`Failed to download file from S3: ${error}`);
    }
}

export async function deleteFile(key: string): Promise<void> {
    try {
        const command = new DeleteObjectCommand({
            Bucket: env.S3_BUCKET,
            Key: key,
        });

        await s3Client.send(command);
    }
    catch (error) {
        console.error("S3 delete error:", error);
        throw new Error(`Failed to delete file from S3: ${error}`);
    }
}

export async function listFiles(
    prefix?: string,
    maxKeys: number = 1000,
): Promise<Array<{ key: string; size: number; lastModified: Date | undefined }>> {
    try {
        const command = new ListObjectsV2Command({
            Bucket: env.S3_BUCKET,
            Prefix: prefix,
            MaxKeys: maxKeys,
        });

        const response = await s3Client.send(command);

        return (
            response.Contents?.map(obj => ({
                key: obj.Key || "",
                size: obj.Size || 0,
                lastModified: obj.LastModified,
            })) || []
        );
    }
    catch (error) {
        console.error("S3 list error:", error);
        throw new Error(`Failed to list files from S3: ${error}`);
    }
}

export async function fileExists(key: string): Promise<boolean> {
    try {
        const command = new HeadObjectCommand({
            Bucket: env.S3_BUCKET,
            Key: key,
        });

        await s3Client.send(command);
        return true;
    }
    catch (error: any) {
        if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
            return false;
        }
        console.error("S3 head object error:", error);
        throw new Error(`Failed to check file existence in S3: ${error}`);
    }
}

export function getFileUrl(key: string): string {
    // Bersihkan slash di awal key kalau ada biar gak double slash
    const cleanKey = key.startsWith("/") ? key.substring(1) : key;

    if (env.S3_FORCE_PATH_STYLE) {
        return `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${cleanKey}`;
    }

    const endpoint = env.S3_ENDPOINT!.replace(/^https?:\/\//, "");
    const protocol = env.S3_ENDPOINT!.startsWith("https") ? "https" : "http";

    return `${protocol}://${env.S3_BUCKET}.${endpoint}/${cleanKey}`;
}

export { s3Client };
