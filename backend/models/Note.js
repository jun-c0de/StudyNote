const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true },
        tags: { type: [String], default: [] },
        category: { type: String, default: "기타" },
        imageUrl: { type: String, default: "" }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);