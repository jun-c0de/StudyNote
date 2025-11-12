const { validationResult } = require("express-validator");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// 회원가입
exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, displayName } = req.body;
        const existing = await User.findOne({ email });

        if (existing) {
            return res.status(400).json({ message: "이미 등록된 이메일입니다." });
        }

        const user = new User({ email, displayName });
        await user.setPassword(password);
        await user.save();

        const token = generateToken(user);
        res.status(201).json({ user: user.toSafeJSON(), token });
    } catch (err) {
        console.error("[Register Error]", err.message);
        console.error("Stack:", err.stack);
        res.status(500).json({ message: "회원가입 중 오류가 발생했습니다." });
    }
};

// 로그인
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "계정이 비활성화되어 있습니다." });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            await user.save();

            if (user.loginAttempts >= 5) {
                user.isActive = false;
                await user.save();
                return res.status(403).json({ message: "로그인 시도 초과. 계정이 잠겼습니다." });
            }

            return res.status(401).json({
                message: `비밀번호가 틀렸습니다. (${user.loginAttempts}/5)`
            });
        }

        // 로그인 성공
        user.loginAttempts = 0;
        user.isLoggined = true;
        user.lastLoginAt = new Date();
        await user.save();

        const token = generateToken(user);
        return res.json({ user: user.toSafeJSON(), token });
    } catch (err) {
        console.error("[Login Error]", err.message);
        console.error("Stack:", err.stack);
        res.status(500).json({ message: "로그인 중 오류가 발생했습니다." });
    }
};

// 프로필 조회
exports.getProfile = async (req, res) => {
    return res.json({ user: req.user.toSafeJSON() });
};

// 로그아웃
exports.logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });

    res.status(200).json({ message: '로그아웃 성공' });
};