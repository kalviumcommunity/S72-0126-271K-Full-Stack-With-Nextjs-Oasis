import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 Client
// Note: In a real app, AWS credentials are automatically loaded from env vars (AWS_ACCESS_KEY_ID, etc.)
// or IAM roles.
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock-key',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock-secret'
    }
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'my-app-uploads';

/**
 * Generates a pre-signed URL for uploading a file to S3.
 * The client can PUT the file directly to this URL.
 * 
 * @param key The unique file path/name in the bucket (e.g., 'avatars/user-123.jpg')
 * @param contentType The MIME type of the file
 * @param expiresInSeconds Duration URL is valid (default 3600s)
 */
export async function generateUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds: number = 3600
): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    try {
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
        return signedUrl;
    } catch (err) {
        console.error('Error generating pre-signed URL:', err);
        throw new Error('Failed to generate upload URL');
    }
}
