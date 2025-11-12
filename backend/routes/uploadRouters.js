const express = require("express");
const uploadController = require("../controllers/uploadController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Presigned URL 생성 (인증 필요)
router.post("/presign-put", authMiddleware, uploadController.presignPut);

module.exports = router;