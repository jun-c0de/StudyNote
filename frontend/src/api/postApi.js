import api from "./axios";

const PUBLIC_BASE = import.meta.env.VITE_S3_PUBLIC_BASE || "";

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

// 1. 파일 업로드: 프리사인 URL을 받아 S3에 직접 파일을 전송합니다.
export const uploadToS3 = async (file, opts = {}) => {
    const {
        data: { url, key },
    } = await api.post("/api/upload/presign", {
        filename: file.name,
        contentType: file.type,
        // replaceKey,
    });

    const putRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
    });

    if (!putRes.ok) throw new Error("S3 업로드 실패");

    return key;
};

// 2. 게시물 생성: 제목, 내용, 파일 키를 서버에 전달하여 게시물을 생성합니다.
export const createPost = async ({ title, content, fileKeys }) => {
    const { data } = await api.post("/api/posts", {
        title,
        content,
        fileUrl: fileKeys,
    });

    return data;
};

// 3. 내 게시물 가져오기: (현재 프로젝트에서는 사용하지 않음)
export const fetchMyPosts = async () => {
    const { data } = await api.get('/api/posts/my')

    return Array.isArray(data) ? data : []
}

// 4. 모든 게시물 가져오기: 커뮤니티 대시보드에서 사용할 함수 (수정 없이 사용 가능)
export const fetchAllPosts = async () => {
    const { data } = await api.get('/api/posts')

    return Array.isArray(data) ? data : []
}
