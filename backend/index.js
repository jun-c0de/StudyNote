const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
// 💡 [수정]: 'auth' 대신 'authRoutes'를 사용해야 합니다.
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");

dotenv.config();
// db 연결 코드가 파일 경로상 config 폴더 안에 있다면 아래처럼 수정해야 합니다.
// const connectDB = require("./config/db");
connectDB();

const app = express();
app.use(cors({
    origin: process.env.FRONT_ORIGIN, // .env 파일에 맞게 수정
    credentials: true
}));
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// health
app.get("/", (req, res) => res.send("SmartNote API is running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
