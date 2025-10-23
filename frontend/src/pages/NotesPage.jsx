import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { fetchNotes, createNote, updateNote, deleteNote } from "../api/axios";
import NoteForm from "../components/notes/NoteForm";
import NoteList from "../components/notes/NoteList";

const NotePage = () => {
    const { user } = useContext(AuthContext);
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        const data = await fetchNotes(); // 본인 + 공유 노트 포함
        setNotes(data);
    };

    const handleCreate = async note => {
        const newNote = await createNote(note);
        setNotes([...notes, newNote]);
    };

    const handleUpdate = async (id, note) => {
        const updated = await updateNote(id, note);
        setNotes(notes.map(n => n._id === id ? updated : n));
    };

    const handleDelete = async id => {
        await deleteNote(id);
        setNotes(notes.filter(n => n._id !== id));
    };

    return (
        <div>
            <h2>{user.displayName}의 노트</h2>
            <NoteForm onSubmit={handleCreate} />
            <NoteList notes={notes} onUpdate={handleUpdate} onDelete={handleDelete} />
        </div>
    );
};

export default NotePage;
