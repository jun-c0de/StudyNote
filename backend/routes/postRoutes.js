const express = require("express");
const { body } = require("express-validator");
const postController = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 전체 공개 게시물 조회 (인증 불필요)
router.get("/", postController.getAllPosts);

// 내 게시물 조회 (인증 필요)
router.get("/my", authMiddleware, postController.getMyPosts);

// 게시물 생성 (인증 필요)
router.post(
    "/",
    authMiddleware,
    [
        body("title").notEmpty().withMessage("제목은 필수입니다"),
        body("content").notEmpty().withMessage("내용은 필수입니다")
    ],
    postController.createPost
);

// 게시물 수정 (인증 필요)
router.put("/:id", authMiddleware, postController.updatePost);

// 게시물 삭제 (인증 필요)
router.delete("/:id", authMiddleware, postController.deletePost);

module.exports = router;