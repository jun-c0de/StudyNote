// src/api/postApi.js
import api from "./axios";

// S3 업로드
export const uploadToS3 = async (file) => {
    const { data } = await api.post("/api/upload/presign", {
        filename: file.name,
        contentType: file.type,
    });

    const res = await fetch(data.url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
    });

    if (!res.ok) throw new Error("S3 업로드 실패");
    return data.key; // DB 저장용 key 반환
};

// CRUD
export const createPost = async ({ title, content, fileKeys }) =>
    (await api.post("/api/posts", { title, content, fileUrl: fileKeys })).data;

export const updatePost = async (id, patch) =>
    (await api.put(`/api/posts/${id}`, patch)).data;

export const deletePost = async (id) => (await api.delete(`/api/posts/${id}`)).data;

export const fetchMyPosts = async () => {
    const { data } = await api.get("/api/posts/my");
    return Array.isArray(data) ? data : [];
};

export const fetchAllPosts = async () => {
    const { data } = await api.get("/api/posts");
    return Array.isArray(data) ? data : [];
};

export const fetchPostById = async (id) => {
    const { data } = await api.get(`/api/posts/${id}`);
    return data;
};
