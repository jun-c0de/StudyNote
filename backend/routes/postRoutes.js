const express = require("express");
const { body } = require("express-validator");
// 💡 [수정] noteController 대신 postController를 임포트합니다.
const postController = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 💡 GET /api/posts: 모든 사용자의 공개 게시물을 가져옵니다. (404 해결)
// postController.getAllPosts로 변경
router.get("/", postController.getAllPosts);

// 💡 GET /api/posts/my: 로그인한 사용자의 게시물만 가져오기 
// postController.getMyPosts로 변경
router.get("/my", authMiddleware, postController.getMyPosts);

// 💡 POST /api/posts: 새 게시물 생성 (로그인 필요)
// postController.createPost로 변경
router.post(
    "/",
    authMiddleware,
    [body("title").notEmpty(), body("content").notEmpty()],
    postController.createPost
);

// 💡 게시물 수정 및 삭제
// postController.updatePost 및 postController.deletePost로 변경
router.put("/:id", authMiddleware, postController.updatePost);
router.delete("/:id", authMiddleware, postController.deletePost);

module.exports = router;
