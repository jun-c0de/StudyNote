const { presignPut } = require("../src/s3"); // S3 유틸리티 임포트
const path = require("path");
const { v4: uuid } = require("uuid");

/**
 * POST /api/upload/presign-put
 * @description 파일 업로드를 위한 Presigned PUT URL을 생성합니다.
 * @param {string} filename - 파일 이름 (확장자 포함)
 * @param {string} mimeType - 파일의 MIME 타입
 */
exports.presignPut = async (req, res) => {
    try {
        const { filename, mimeType } = req.body;

        if (!filename || !mimeType) {
            return res.status(400).json({ message: "filename 및 mimeType이 필요합니다." });
        }

        // 1. 파일 이름 유효성 검사 (보안 강화)
        const ext = path.extname(filename).toLowerCase();
        const basename = path.basename(filename, ext);

        if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
            return res.status(400).json({ message: "지원되지 않는 파일 형식입니다. (jpg, png, gif만 허용)" });
        }

        // 2. S3 Key (경로) 생성
        // 경로: 'uploads/2024/07/{UUID}-{filename}'
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const uniqueId = uuid();

        // 최종 S3 Key: 파일명을 안전하게 인코딩합니다.
        const Key = `uploads/${year}/${month}/${uniqueId}-${encodeURIComponent(basename)}${ext}`;

        // 3. Presigned URL 생성 (업로드 만료 시간 300초 = 5분)
        const presignedUrl = await presignPut(Key, mimeType, 300);

        // 4. 클라이언트에게 URL 및 S3 Key 반환
        res.json({ presignedUrl, Key });

    } catch (err) {
        console.error("Presign Put Error:", err);
        res.status(500).json({ message: "Presigned URL 생성 중 오류가 발생했습니다." });
    }
};
