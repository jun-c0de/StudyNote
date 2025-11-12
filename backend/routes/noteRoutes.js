const express = require("express");
const { body } = require("express-validator");
const noteController = require("../controllers/noteController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 모든 노트 가져오기 (로그인 필요)
router.get("/", authMiddleware, noteController.getNotes);

// 특정 노트 조회
router.get("/:id", authMiddleware, noteController.getNoteById);

// 노트 생성
router.post(
    "/",
    authMiddleware,
    [
        body("title").notEmpty().withMessage("제목은 필수입니다"),
        body("content").notEmpty().withMessage("내용은 필수입니다")
    ],
    noteController.createNote
);

// 노트 수정
router.put("/:id", authMiddleware, noteController.updateNote);

// 노트 삭제
router.delete("/:id", authMiddleware, noteController.deleteNote);

module.exports = router;