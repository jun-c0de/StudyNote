const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");


// 회원가입
router.post(
    "/register",
    [
        body("email").isEmail().withMessage("유효한 이메일을 입력하세요"),
        body("password").isLength({ min: 6 }).withMessage("비밀번호는 최소 6자"),
    ],
    authController.register
);

// 로그인
router.post("/login", authController.login);

// 프로필 조회 (GET /api/auth/me 요청 처리)
// 프론트엔드가 요청하는 '/me' 경로를 기존 getProfile 컨트롤러에 연결
router.get("/me", authMiddleware, authController.getProfile);

// 로그아웃 (프론트엔드가 POST /logout을 요청하며, 인증 미들웨어 추가)
// ⚠️ 주의: authController.logout 함수가 반드시 존재해야 합니다.
router.post("/logout", authMiddleware, authController.logout);

module.exports = router;
