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

// 프로필 조회
router.get("/profile", authMiddleware, authController.getProfile);

module.exports = router;
