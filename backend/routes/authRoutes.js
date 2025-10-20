const express = require("express");
const { check } = require("express-validator");
const { register, login, getProfile } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/register",
    [
        check("email", "유효한 이메일을 입력하세요").isEmail(),
        check("password", "비밀번호는 최소 6자 이상").isLength({ min: 6 })
    ],
    register
);

router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);

module.exports = router;
