import axios from "axios";

// 환경 변수에서 BASE_URL을 가져옵니다.
const BASE_URL = import.meta.env.VITE_API_URL;

// ===== 로컬스토리지 유틸리티 =====
export function saveAuthToStorage({ user, token }) {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    if (token) localStorage.setItem("token", token);
}

export function clearAuthStorage() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
}

// Axios 인스턴스 생성
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" }
});

// 요청 인터셉터: JWT (토큰) 자동 추가
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터: 401/403 응답 시 로컬 스토리지 클리어
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

// ===== Auth API 함수 =====

export async function register({ email, password, displayname }) {
    const { data } = await api.post('/api/auth/register', {
        email,
        password,
        displayname
    });
    return data;
}

export async function fetchMe() {
    const { data } = await api.get('/api/auth/me');
    return data;
}

export async function login({ email, password }) {
    const { data } = await api.post("/api/auth/login", { email, password });
    return data;
}

export async function logout() {
    return await api.post('/api/auth/logout');
}

export default api;