const Post = require("../models/Post"); // 💡 Post 모델 사용

// GET /api/posts - 모든 게시물을 가져옵니다. (인증 불필요)
exports.getAllPosts = async (req, res) => {
    try {
        // 모든 Post를 최신 순으로 가져옵니다.
        const posts = await Post.find({})
            .populate("user", "displayName") // 작성자 정보 포함
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "전체 게시물 조회 중 오류" });
    }
};

// GET /api/posts/my - 로그인한 사용자의 게시물만 가져옵니다. (인증 필요)
exports.getMyPosts = async (req, res) => {
    try {
        const user = req.user; // authMiddleware에서 설정됨

        const posts = await Post.find({ user: user._id })
            .populate("user", "displayName") // 작성자 정보 포함
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "내 게시물 조회 중 오류" });
    }
};


// POST /api/posts - 새 게시물 생성
exports.createPost = async (req, res) => {
    try {
        const { title, content, tags, category, fileUrl } = req.body;

        const post = new Post({
            user: req.user._id,
            title,
            content,
            tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
            category: category || "커뮤니티",
            imageUrl: fileUrl // fileUrl을 imageUrl 필드에 저장
        });
        const saved = await post.save();

        // 프론트엔드 반환 시 작성자 정보(displayName)도 포함
        const populatedPost = await Post.findById(saved._id).populate("user", "displayName");

        res.status(201).json(populatedPost);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: "게시물 생성 중 오류" });
    }
};

// PUT /api/posts/:id - 게시물 수정
exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });

        // 작성자 또는 관리자만 수정 가능
        if (post.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "수정 권한이 없습니다." });
        }

        post.title = req.body.title || post.title;
        post.content = req.body.content || post.content;
        post.tags = req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags]) : post.tags;
        post.category = req.body.category || post.category;
        post.imageUrl = req.body.imageUrl || post.imageUrl;

        const updated = await post.save();
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: "게시물 수정 중 오류" });
    }
};

// DELETE /api/posts/:id - 게시물 삭제
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });

        // 작성자 또는 관리자만 삭제 가능
        if (post.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "삭제 권한이 없습니다." });
        }

        await post.deleteOne();
        res.json({ message: "게시물이 삭제되었습니다." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "게시물 삭제 중 오류" });
    }
};
