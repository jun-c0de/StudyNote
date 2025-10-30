import axios from "axios";

// 환경 변수에서 BASE_URL을 가져옵니다. (Vite 환경을 가정)
const BASE_URL = import.meta.env.VITE_API_URL || "/"; // 기본값으로 "/" 설정

// ===== 로컬스토리지 유틸리티 =====

/**
 * 사용자 정보와 토큰을 로컬 스토리지에 저장합니다.
 * @param {{ user: object, token: string }} authData - 사용자 객체와 JWT 토큰
 */
export function saveAuthToStorage({ user, token }) {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    if (token) localStorage.setItem("token", token);
}

/**
 * 로컬 스토리지에서 사용자 정보와 토큰을 제거합니다.
 */
export function clearAuthStorage() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
}

/**
 * 오류 메시지를 추출합니다.
 * @param {any} error - Axios 에러 객체
 * @param {string} fallback - 대체 메시지
 * @returns {string} 추출된 에러 메시지
 */
export function getErrorMessage(error, fallback = '요청 실패') {
    return error.response?.data?.message || error.message || fallback;
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
        else delete config.headers.Authorization; // 토큰이 없으면 헤더 제거 (불필요한 헤더 전송 방지)

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

export async function login({ email, password }) {
    const { data } = await api.post("/api/auth/login", { email, password });
    return data;
}

export async function fetchMe() {
    const { data } = await api.get('/api/auth/me');
    return data;
}

export async function logout() {
    // 백엔드 세션/쿠키를 정리합니다.
    return await api.post('/api/auth/logout');
}

export default api;