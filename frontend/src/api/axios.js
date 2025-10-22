import axios from "axios";

// 환경변수에서 가져오기 (Vite)
const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: BASE_URL,       // 예: http://localhost:3000
    withCredentials: true,
    headers: { "Content-Type": "application/json" }
});

// JWT 자동 헤더 추가
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 에러 처리
api.interceptors.response.use(
    (res) => res,
    (err) => {
        const code = err?.response?.status;
        if (code === 401 || code === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
        return Promise.reject(err);
    }
);

// 에러 메시지 추출
export function getErrorMessage(error, fallback = "요청 실패") {
    return error.response?.data?.message || error.message || fallback;
}

// 회원가입
export async function register({ email, password, displayName }) {
    const { data } = await api.post("/auth/register", {
        email,
        password,
        displayName // 백엔드 User 스키마와 일치
    });
    return data;
}

// 로그인
export async function login({ email, password }) {
    const { data } = await api.post("/auth/login", {
        email,
        password
    });
    return data;
}

// 내 정보 조회
export async function fetchMe() {
    const { data } = await api.get("/auth/me");
    return data;
}

// 로그아웃
export async function logout() {
    return await api.post("/auth/logout");
}

// 로컬스토리지에 인증 정보 저장
export function saveAuthToStorage({ user, token }) {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    if (token) localStorage.setItem("token", token);
}

// 로컬스토리지 인증 정보 삭제
export function clearAuthStorage() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
}

export default api;
