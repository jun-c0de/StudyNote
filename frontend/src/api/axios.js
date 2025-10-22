// src/api/axios.js
import axios from "axios";

// 환경변수에서 API 주소 가져오기
const BASE_URL = import.meta.env.VITE_API_URL;

// Axios 인스턴스
const api = axios.create({
    baseURL: BASE_URL, // 예: http://localhost:3000
    withCredentials: true,
    headers: { "Content-Type": "application/json" }
});

// 요청 인터셉터 - JWT 자동 추가
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터 - 인증 만료 시 처리
api.interceptors.response.use(
    (res) => res,
    (err) => {
        const code = err?.response?.status;
        if (code === 401 || code === 403) {
            clearAuthStorage();
        }
        return Promise.reject(err);
    }
);

// 에러 메시지 유틸
export function getErrorMessage(error, fallback = "요청 실패") {
    return error.response?.data?.message || error.message || fallback;
}

// ====== Auth 관련 API ======

// 회원가입
export async function register({ email, password, displayName }) {
    const { data } = await api.post("/api/auth/register", {
        email,
        password,
        displayName
    });
    return data;
}

// 로그인
export async function login({ email, password }) {
    const { data } = await api.post("/api/auth/login", {
        email,
        password
    });
    return data;
}

// 내 정보 조회
export async function fetchMe() {
    const { data } = await api.get("/api/auth/me");
    return data;
}

// 로그아웃
export async function logout() {
    return await api.post("/api/auth/logout");
}

// ====== 로컬스토리지 유틸 ======
export function saveAuthToStorage({ user, token }) {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    if (token) localStorage.setItem("token", token);
}

export function clearAuthStorage() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
}

// ====== 노트 관련 API (예시) ======
export async function fetchNotes() {
    const { data } = await api.get("/api/notes");
    return data;
}

export async function createNote(note) {
    const { data } = await api.post("/api/notes", note);
    return data;
}

export async function updateNote(id, note) {
    const { data } = await api.put(`/api/notes/${id}`, note);
    return data;
}

export async function deleteNote(id) {
    await api.delete(`/api/notes/${id}`);
}

export default api;
