const { presignPut } = require("../utils/s3");
const path = require("path");
const { v4: uuid } = require("uuid");

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/upload/presign-put
 * @description 파일 업로드를 위한 Presigned PUT URL을 생성합니다.
 */
exports.presignPut = async (req, res) => {
    try {
        const { filename, mimeType, fileSize } = req.body;

        if (!filename || !mimeType) {
            return res.status(400).json({ message: "filename 및 mimeType이 필요합니다." });
        }

        // 파일 크기 검증
        if (fileSize && fileSize > MAX_FILE_SIZE) {
            return res.status(400).json({
                message: "파일 크기는 5MB를 초과할 수 없습니다."
            });
        }

        // MIME 타입 검증
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
        if (!allowedMimeTypes.includes(mimeType)) {
            return res.status(400).json({
                message: "지원되지 않는 파일 형식입니다. (jpg, png, gif만 허용)"
            });
        }

        // 파일 이름 유효성 검사
        const ext = path.extname(filename).toLowerCase();
        const basename = path.basename(filename, ext);

        if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
            return res.status(400).json({
                message: "지원되지 않는 파일 확장자입니다."
            });
        }

        // S3 Key 생성
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const uniqueId = uuid();

        const Key = `uploads/${year}/${month}/${uniqueId}-${encodeURIComponent(basename)}${ext}`;

        // Presigned URL 생성 (5분 유효)
        const presignedUrl = await presignPut(Key, mimeType, 300);

        // S3 Base URL 구성
        const s3BaseUrl = process.env.S3_BASE_URL || `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`;
        const fileUrl = `${s3BaseUrl}/${Key}`;

        res.json({
            presignedUrl,
            Key,
            fileUrl  // 업로드 후 접근할 수 있는 최종 URL
        });

    } catch (err) {
        console.error("Presign Put Error:", err);
        res.status(500).json({ message: "Presigned URL 생성 중 오류가 발생했습니다." });
    }
};