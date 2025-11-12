const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// 환경 변수 확인
const required = [
    "AWS_REGION",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "S3_BUCKET",
];

const missing = required.filter((k) => !process.env[k]);

if (missing.length) {
    console.error("❌ [S3 ENV Missing]", missing);
}

// S3 클라이언트 초기화
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const Bucket = process.env.S3_BUCKET;

/**
 * 업로드를 위한 Presigned URL 생성
 */
async function presignPut(Key, ContentType, sec = 300) {
    if (!Bucket) throw new Error("S3 bucket is undefined");
    if (!Key) throw new Error("Key is required");

    const cmd = new PutObjectCommand({ Bucket, Key, ContentType });
    return getSignedUrl(s3, cmd, { expiresIn: sec });
}

/**
 * 다운로드를 위한 Presigned URL 생성
 */
async function presignGet(Key, sec = 300) {
    if (!Bucket) throw new Error("S3 bucket is undefined");
    if (!Key) throw new Error("Key is required");

    const cmd = new GetObjectCommand({ Bucket, Key });
    return getSignedUrl(s3, cmd, { expiresIn: sec });
}

/**
 * S3 객체 삭제
 */
async function deleteObject(Key) {
    if (!Bucket) throw new Error("S3 bucket is undefined");
    if (!Key) throw new Error("Key is required");

    const cmd = new DeleteObjectCommand({ Bucket, Key });
    await s3.send(cmd);

    console.log(`✅ [S3] Deleted: ${Key}`);
    return { ok: true, message: `Deleted: ${Key}` };
}

/**
 * S3 객체 업데이트 (서버 측 직접 업로드)
 */
async function updateObject(Key, Body, ContentType) {
    if (!Bucket) throw new Error("S3 bucket is undefined");
    if (!Key) throw new Error("Key is required");