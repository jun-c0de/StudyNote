const { validationResult } = require("express-validator");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// REGISTER
exports.register = async (req, res) => {
    try {
        // optional: validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password, displayName } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "이미 등록된 이메일입니다." });

        const user = new User({ email, displayName });
        await user.setPassword(password);
        await user.save();

        const token = generateToken(user);
        res.status(201).json({ user: user.toSafeJSON(), token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "회원가입 중 오류가 발생했습니다." });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });

        if (!user.isActive) return res.status(403).json({ message: "계정이 비활성화되어 있습니다." });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            await user.save();
            if (user.loginAttempts >= 5) {
                user.isActive = false;
                await user.save();
                return res.status(403).json({ message: "로그인 시도 초과. 계정이 잠겼습니다." });
            }
            return res.status(401).json({ message: `비밀번호가 틀렸습니다. (${user.loginAttempts}/5)` });
        }

        // success
        user.loginAttempts = 0;
        user.isLoggined = true;
        user.lastLoginAt = new Date();
        await user.save();

        const token = generateToken(user);
        return res.json({ user: user.toSafeJSON(), token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "로그인 중 오류가 발생했습니다." });
    }
};

// PROFILE
exports.getProfile = async (req, res) => {
    // req.user is populated by authMiddleware
    // 프론트엔드에서 요구하는 상세 정보 (me)를 제공합니다.
    return res.json({ user: req.user.toSafeJSON() });
};


/**
 * POST /api/auth/logout
 * @description 서버 세션 또는 토큰 쿠키를 제거하여 로그아웃 처리합니다.
 */
exports.logout = (req, res) => {
    // 토큰이 HTTP-only 쿠키에 저장되어 있다고 가정하고 쿠키를 삭제합니다.
    // JWT를 localStorage에 저장하는 방식이라면 이 로직은 필요 없습니다.
    // 하지만 프론트엔드가 POST 요청을 보내므로, 서버 측에서 정리할 것이 없다면 200만 반환합니다.
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });

    // 클라이언트 측에게 로그아웃이 성공했음을 알립니다.
    // 프론트엔드 (AuthContext)에서 이 응답을 받아 로컬 스토리지를 지우게 됩니다.
    res.status(200).json({ message: '로그아웃 성공' });
};
