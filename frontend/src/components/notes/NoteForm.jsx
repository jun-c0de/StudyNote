import { useState } from "react";
import api from "../../api/axios";

const NoteForm = ({ note, onSaved }) => {
    const [title, setTitle] = useState(note?.title || "");
    const [content, setContent] = useState(note?.content || "");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (note?._id) {
                res = await api.put(`/notes/${note._id}`, { title, content });
            } else {
                res = await api.post("/notes", { title, content });
            }
            console.log("[NoteForm] Saved", res.data);
            onSaved(res.data);
            setTitle("");
            setContent("");
        } catch (err) {
            console.error(err.response);
            alert("노트 저장 오류");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <textarea
                placeholder="내용"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
            />
            <button type="submit">{note?._id ? "수정" : "작성"}</button>
        </form>
    );
};

export default NoteForm;
