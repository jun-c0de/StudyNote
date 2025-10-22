import { useState } from "react";

const NoteForm = ({ onSubmit, initialData = { title: "", content: "" } }) => {
    const [title, setTitle] = useState(initialData.title);
    const [content, setContent] = useState(initialData.content);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ title, content });
        setTitle("");
        setContent("");
    };

    return (
        <form onSubmit={handleSubmit}>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목" />
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="내용" />
            <button type="submit">저장</button>
        </form>
    );
};

export default NoteForm;
