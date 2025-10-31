const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// 💡 [수정] DB 연결 코드를 가져옵니다.
const connectDB = require("./config/db");
const s3 = require("./src/s3");

// 라우터 임포트
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const uploadRoutes = require("./routes/upload");

// 환경 변수 로드
dotenv.config();

// 💡 [수정] connectDB() 함수를 호출하여 MongoDB에 연결을 시도합니다.
connectDB();

const app = express();

// CORS 설정
app.use(cors({
    origin: process.env.FRONT_ORIGIN,
    credentials: true
}));

// JSON 및 URL-encoded 본문 파싱
app.use(express.json());

// --- 라우터 연결 ---
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/upload", uploadRoutes); // S3 Presigned URL 라우터 연결

// health check
app.get("/", (req, res) => res.send("SmartNote API is running"));

// --- 서버 시작 ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
