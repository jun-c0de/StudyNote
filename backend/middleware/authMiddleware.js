const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    let token;
    try {
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select("-passwordHash");
            if (!user) return res.status(401).json({ message: "유효하지 않은 사용자입니다." });
            if (!user.isActive) return res.status(403).json({ message: "계정이 비활성화되었습니다." });
            req.user = user;
            return next();
        }
        return res.status(401).json({ message: "인증 토큰이 없습니다." });
    } catch (err) {
        console.error(err);
        return res.status(401).json({ message: "토큰 검증 실패" });
    }
};

module.exports = authMiddleware;
