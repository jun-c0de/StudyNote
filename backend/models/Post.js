const mongoose = require("mongoose");

// Note 모델의 구조를 그대로 사용하여 Post 모델을 정의합니다.
const postSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true
        },
        tags: {
            type: [String],
            default: []
        },
        // 'Note'에서 'Category'였던 필드를 유지합니다.
        category: {
            type: String,
            default: "커뮤니티" // 기본값을 '기타'에서 '커뮤니티'로 변경
        },
        // 게시물에 첨부된 이미지 URL
        imageUrl: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
