const mongoose = require("mongoose");

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
        category: {
            type: String,
            default: "커뮤니티"
        },
        imageUrl: {
            type: String,
            default: ""
        },
        // 🆕 추가 기능
        views: {
            type: Number,
            default: 0
        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        likeCount: {
            type: Number,
            default: 0
        },
        isPublic: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);