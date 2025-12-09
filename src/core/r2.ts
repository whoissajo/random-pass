import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Helper to handle potentially missing env vars during build
const getEnv = (key: string) => process.env[key] || ''

const R2_ACCOUNT_ID = getEnv('R2_ACCOUNT_ID')
const R2_ACCESS_KEY_ID = getEnv('R2_ACCESS_KEY_ID')
const R2_SECRET_ACCESS_KEY = getEnv('R2_SECRET_ACCESS_KEY')
const R2_BUCKET_NAME = getEnv('R2_BUCKET_NAME')

export const r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
    // CRITICAL: Disable fancy checksums that break R2 presigned URLs
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
})

export async function getUploadUrl(filename: string, fileType: string) {
    const key = `${Date.now()}-${filename.replace(/\s/g, '-')}`

    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        ContentType: fileType,
        // Explicitly disable checksum algorithm if possible by not setting it
        // The AWS SDK v3 sometimes defaults to adding it.
        // Setting it to undefined might help force it off for the signature
        ChecksumAlgorithm: undefined,
    })

    // URL valid for 1 hour
    const uploadUrl = await getSignedUrl(r2, command, {
        import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Helper to handle potentially missing env vars during build
const getEnv = (key: string) => process.env[key] || ''

const R2_ACCOUNT_ID = getEnv('R2_ACCOUNT_ID')
const R2_ACCESS_KEY_ID = getEnv('R2_ACCESS_KEY_ID')
const R2_SECRET_ACCESS_KEY = getEnv('R2_SECRET_ACCESS_KEY')
const R2_BUCKET_NAME = getEnv('R2_BUCKET_NAME')

export const r2 = new S3Client({
            region: 'auto',
            endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: R2_ACCESS_KEY_ID,
                secretAccessKey: R2_SECRET_ACCESS_KEY,
            },
            // CRITICAL: Disable fancy checksums that break R2 presigned URLs
            requestChecksumCalculation: "WHEN_REQUIRED",
            responseChecksumValidation: "WHEN_REQUIRED",
        })

export async function getUploadUrl(filename: string, fileType: string) {
        const key = `${Date.now()}-${filename.replace(/\s/g, '-')}`

    const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            ContentType: fileType,
            // Explicitly disable checksum algorithm if possible by not setting it
            // The AWS SDK v3 sometimes defaults to adding it.
            // Setting it to undefined might help force it off for the signature
            ChecksumAlgorithm: undefined,
        })

    // URL valid for 1 hour
    const uploadUrl = await getSignedUrl(r2, command, {
            expiresIn: 3600,
            // Ensure no unexpected headers are signed
            signableHeaders: new Set(['host', 'content-type']),
        })

    // Public URL for accessing the file later
    // Custom Domain or R2dev URL
    const publicDomain = process.env.R2_PUBLIC_DOMAIN || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}` // fallback
    const publicUrl = `${publicDomain}/${key}`

    return { uploadUrl, publicUrl, key }
    }

export async function deleteFile(key: string) {
        const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')

        const command = new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
        })

        await r2.send(command)
    }
