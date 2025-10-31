const express = require('express');
const { getSignedUrl } = require('../src/s3'); // 💡 수정: 경로를 '../src/s3'로 변경
const crypto = require('crypto');
const router = express.Router();

// 임의의 파일 이름 생성 (보안 및 중복 방지)
const generateFileName = (originalName) => {
    // 파일 확장자를 추출합니다.
    const extensionMatch = originalName.match(/\.([0-9a-z]+)(?=[?#])|(\.)(?:[^?#]*)$/i);
    const extension = extensionMatch ? extensionMatch[0] : '';

    // 16바이트 랜덤 문자열을 16진수로 변환하여 고유 이름을 만듭니다.
    const randomName = crypto.randomBytes(16).toString('hex');

    return `${randomName}${extension}`;
};

// POST /api/upload/presigned-url
// 클라이언트가 서버로부터 업로드할 S3 URL을 요청하는 엔드포인트
router.post('/presigned-url', async (req, res) => {
    try {
        // 클라이언트가 요청 본문(body)에 담아 보낸 파일 이름과 타입을 가져옵니다.
        const { fileName, fileType } = req.body;

        if (!fileName || !fileType) {
            return res.status(400).json({ message: "File name and file type are required." });
        }

        // 실제 S3에 저장될 고유한 파일 이름 생성 (Key)
        const key = generateFileName(fileName);

        // S3 유틸리티 함수를 호출하여 Presigned URL 생성
        const signedUrl = await getSignedUrl(key, fileType);

        // 클라이언트에게 Presigned URL과 최종 S3 Key(DB에 저장될 경로)를 반환
        res.status(200).json({
            url: signedUrl,
            key: key
        });

    } catch (error) {
        console.error("Error generating presigned URL:", error);
        // 클라이언트에게 내부 서버 오류 응답
        res.status(500).json({ message: "Failed to generate presigned URL." });
    }
});

module.exports = router;
