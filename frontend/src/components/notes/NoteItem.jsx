import { useState } from "react";
import NoteForm from "./NoteForm";

const NoteItem = ({ note, onUpdate, onDelete }) => {
    const [editing, setEditing] = useState(false);

    const handleUpdate = (updatedNote) => {
        onUpdate(note._id, updatedNote);
        setEditing(false);
    };

    return (
        <li>
            {editing ? (
                <NoteForm onSubmit={handleUpdate} initialData={note} />
            ) : (
                <div>
                    <h3>{note.title}</h3>
                    <p>{note.content}</p>
                    <button onClick={() => setEditing(true)}>수정</button>
                    <button onClick={() => onDelete(note._id)}>삭제</button>
                </div>
            )}
        </li>
    );
};

export default NoteItem;
