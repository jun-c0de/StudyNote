const Note = require("../models/Note");

// GET /api/notes
exports.getNotes = async (req, res) => {
    try {
        const user = req.user;
        const query = { user: user._id };
        const { q, tag, category } = req.query;

        if (q) {
            query.$or = [
                { title: { $regex: q, $options: "i" } },
                { content: { $regex: q, $options: "i" } }
            ];
        }
        if (tag) query.tags = tag;
        if (category) query.category = category;

        const notes = await Note.find(query).sort({ updatedAt: -1 });
        res.json(notes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "노트 조회 중 오류" });
    }
};

// GET /api/notes/:id
exports.getNoteById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id).populate("user", "email displayName role");
        if (!note) {
            return res.status(404).json({ message: "노트를 찾을 수 없습니다." });
        }

        // 소유자 또는 관리자만 조회 가능
        if (note.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "권한이 없습니다." });
        }

        res.json(note);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "노트 조회 중 오류" });
    }
};

// POST /api/notes
exports.createNote = async (req, res) => {
    try {
        const { title, content, tags, category, imageUrl } = req.body;
        const note = new Note({
            user: req.user._id,
            title,
            content,
            tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
            category,
            imageUrl
        });
        const saved = await note.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: "노트 생성 중 오류" });
    }
};

// PUT /api/notes/:id
exports.updateNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: "노트를 찾을 수 없습니다." });
        }

        // 소유자 또는 관리자만 수정 가능
        if (note.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "권한이 없습니다." });
        }

        note.title = req.body.title || note.title;
        note.content = req.body.content || note.content;
        note.tags = req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags]) : note.tags;
        note.category = req.body.category || note.category;
        note.imageUrl = req.body.imageUrl || note.imageUrl;

        const updated = await note.save();
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: "노트 수정 중 오류" });
    }
};

// DELETE /api/notes/:id
exports.deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: "노트를 찾을 수 없습니다." });
        }

        // 소유자 또는 관리자만 삭제 가능
        if (note.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "권한이 없습니다." });
        }

        await note.deleteOne();
        res.json({ message: "노트가 삭제되었습니다." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "노트 삭제 중 오류" });
    }
};