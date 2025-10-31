import api from "./axios";

const PUBLIC_BASE = import.meta.env.VITE_S3_PUBLIC_BASE || "";

// 이 함수들은 기존 코드의 유틸리티이므로 그대로 유지합니다.
function urlToKey(u) {
    if (!u) return "";
    const s = String(u);
    if (!/^https?:\/\//i.test(s)) return s; // 이미 key
    if (PUBLIC_BASE) {
        const base = PUBLIC_BASE.replace(/\/+$/, "");
        return s.startsWith(base + "/") ? s.slice(base.length + 1) : s;
    }
    try {
        const url = new URL(s);
        return url.pathname.replace(/^\/+/, ""); // /uploads/.. → uploads/..
    } catch {
        return s; // fallback
    }
}

function toKeyArray(val) {
    if (!val) return [];
    const arr = Array.isArray(val) ? val : [val];
    return arr.map(urlToKey).filter(Boolean);
}

// ----------------------------------------------------------------------
// S3 업로드 로직 (분리된 함수)
// ----------------------------------------------------------------------

/**
 * 1. 백엔드에 파일 정보(이름, 타입)를 보내 S3 Presigned PUT URL을 요청합니다.
 * @returns {Promise<{url: string, key: string}>} Presigned URL과 S3 키
 */
export const getPresignedUrl = async (fileName, fileType) => {
    const {
        data: { url, key },
    } = await api.post("/api/upload/presign", {
        filename: fileName,
        contentType: fileType,
    });

    return { url, key };
};

/**
 * 2. Presigned URL을 사용하여 S3에 파일을 직접 PUT 요청으로 업로드합니다.
 * @param {string} url - Presigned PUT URL
 * @param {File} file - 업로드할 파일 객체
 * @param {string} fileType - 파일의 MIME 타입
 * @returns {Promise<void>}
 */
export const uploadFileToS3 = async (url, file, fileType) => {
    const putRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": fileType },
        body: file,
    });

    if (!putRes.ok) {
        console.error("S3 Upload Failed Response:", await putRes.text());
        throw new Error("S3 업로드 실패");
    }
};

// ----------------------------------------------------------------------
// 기존 UserDashboard.jsx와의 호환성을 위한 함수 재정의 (필수)
// ----------------------------------------------------------------------

/**
 * [호환성 복원] 파일 업로드: Presign 요청과 S3 업로드를 모두 처리하고 최종 키를 반환합니다.
 * UserDashboard.jsx와 같은 기존 컴포넌트에서 이 함수를 사용합니다.
 *
 * @param {File} file - 업로드할 파일 객체
 * @returns {Promise<string>} 최종 S3 키
 */
export const uploadToS3 = async (file, opts = {}) => {
    // 1. Presigned URL 요청 (기존 로직)
    const { url, key } = await getPresignedUrl(file.name, file.type);

    // 2. S3에 파일 업로드 (기존 로직)
    await uploadFileToS3(url, file, file.type);

    return key;
};

// ----------------------------------------------------------------------
// 게시물 관련 함수들 (기존 이름 유지)
// ----------------------------------------------------------------------

// 3. 게시물 생성
export const createPost = async ({ title, content, fileKeys }) => {
    const { data } = await api.post("/api/posts", {
        title,
        content,
        fileUrl: Array.isArray(fileKeys) ? fileKeys[0] : fileKeys,
    });

    return data;
};

// 4. 내 게시물 가져오기
export const fetchMyPosts = async () => {
    const { data } = await api.get('/api/posts/my')

    return Array.isArray(data) ? data : []
}

// 5. 모든 게시물 가져오기
export const fetchAllPosts = async () => {
    const { data } = await api.get('/api/posts')

    return Array.isArray(data) ? data : []
}
