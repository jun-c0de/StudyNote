const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// --- 환경 변수 확인 ---
// 필수 환경 변수가 설정되었는지 확인합니다.
const required = [
    "AWS_REGION",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "S3_BUCKET",
];

const missing = required.filter((k) => !process.env[k]);

if (missing.length) {
    // 환경 변수가 누락된 경우 서버 시작 시 경고를 출력합니다.
    console.error("[S3 ENV Missing]", missing);
}

// --- S3 클라이언트 초기화 ---
// .env 파일의 환경 변수를 사용하여 AWS S3 클라이언트를 설정합니다.
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const Bucket = process.env.S3_BUCKET;

/**
 * 객체 업로드를 위한 Presigned URL을 생성합니다.
 * 프론트엔드가 이 URL을 사용하여 S3에 파일을 직접 PUT 요청으로 업로드합니다.
 * @param {string} Key - S3 버킷 내 파일 경로 및 이름
 * @param {string} ContentType - 업로드할 파일의 MIME 타입 (예: image/jpeg)
 * @param {number} sec - URL 만료 시간 (초)
 * @returns {Promise<string>} 서명된 Presigned URL
 */
async function presignPut(Key, ContentType, sec = 300) {
    if (!Bucket) throw new Error("s3 bucket is undefined");
    if (!Key) throw new Error("Key is required");

    // PutObjectCommand를 생성하고 서명합니다.
    const cmd = new PutObjectCommand({ Bucket, Key, ContentType });

    return getSignedUrl(s3, cmd, { expiresIn: sec });
}

/**
 * 객체 다운로드를 위한 Presigned URL을 생성합니다. (비공개 객체 접근용)
 * @param {string} Key - S3 버킷 내 파일 경로 및 이름
 * @param {number} sec - URL 만료 시간 (초)
 * @returns {Promise<string>} 서명된 Presigned URL
 */
async function presignGet(Key, sec = 300) {
    if (!Bucket) throw new Error("s3 bucket is undefined");
    if (!Key) throw new Error("Key is required");

    // GetObjectCommand를 생성하고 서명합니다.
    const cmd = new GetObjectCommand({ Bucket, Key });

    return getSignedUrl(s3, cmd, { expiresIn: sec });
}

/**
 * S3 버킷에서 특정 객체를 삭제합니다. (서버 측 요청)
 * @param {string} Key - 삭제할 객체의 키
 * @returns {Promise<{ok: boolean, message: string}>} 삭제 결과
 */
async function deleteObject(Key) {
    if (!Bucket) throw new Error("s3 bucket is undefined");
    if (!Key) throw new Error("Key is required");

    const cmd = new DeleteObjectCommand({ Bucket, Key });

    await s3.send(cmd);

    console.log(`[s3] Deleted: ${Key}`);
    return { ok: true, message: `Deleted : ${Key}` };
}

/**
 * S3 버킷의 객체를 업데이트합니다. (서버 측 요청)
 * Presigned URL 방식에서는 보통 사용하지 않으나, 서버 측에서 직접 파일을 업데이트/업로드할 때 사용됩니다.
 * @param {string} Key - 객체 키
 * @param {*} Body - 객체의 내용 (Buffer, Stream 등)
 * @param {string} ContentType - 객체의 MIME 타입
 * @returns {Promise<{ok: boolean, message: string}>} 업데이트 결과
 */
async function updateObject(Key, Body, ContentType) {
    if (!Bucket) throw new Error("s3 bucket is undefined");
    if (!Key) throw new Error("Key is required");

    const cmd = new PutObjectCommand({
        Bucket,
        Key,
        Body,
        ContentType,
    });

    await s3.send(cmd);

    console.log(`[s3] Updated: ${Key}`);
    return { ok: true, message: `Updated : ${Key}` };
}

// 이 함수들을 외부에서 사용할 수 있도록 내보냅니다.
module.exports = {
    s3,
    presignPut,
    presignGet,
    Bucket,
    updateObject,
    deleteObject,
};
