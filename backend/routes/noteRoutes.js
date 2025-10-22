const express = require("express");
const { body } = require("express-validator");
const noteController = require("../controllers/noteController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 모든 노트 가져오기 (로그인 필요)
router.get("/", authMiddleware, noteController.getNotes);

// 노트 생성
router.post(
    "/",
    authMiddleware,
    [body("title").notEmpty(), body("content").notEmpty()],
    noteController.createNote
);

// 노트 수정
router.put("/:id", authMiddleware, noteController.updateNote);

// 노트 삭제
router.delete("/:id", authMiddleware, noteController.deleteNote);

module.exports = router;
