const express = require("express");
const {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote
} = require("../controllers/noteController");

const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.use(authMiddleware); // 모든 노트 라우트는 인증 필요

router.route("/").get(getNotes).post(createNote);
router.route("/:id").get(getNoteById).put(updateNote).delete(deleteNote);

module.exports = router;
