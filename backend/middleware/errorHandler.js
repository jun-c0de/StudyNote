/**
 * 전역 에러 핸들러 미들웨어
 * 모든 라우터에서 발생한 에러를 처리합니다.
 */
const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err.message);
    console.error('Stack:', err.stack);

    // Mongoose 유효성 검사 오류
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: "입력 데이터가 올바르지 않습니다.",
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    // JWT 오류
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }

    // JWT 만료 오류
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "토큰이 만료되었습니다." });
    }

    // Mongoose CastError (잘못된 ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({ message: "잘못된 ID 형식입니다." });
    }

    // Mongoose 중복 키 오류
    if (err.code === 11000) {
        return res.status(400).json({ message: "이미 존재하는 데이터입니다." });
    }

    // 기본 서버 오류
    res.status(err.status || 500).json({
        message: err.message || "서버 내부 오류가 발생했습니다.",
        ...(process.env.NODE_ENV === 'development' && {
            error: err.message,
            stack: err.stack
        })
    });
};

module.exports = errorHandler;