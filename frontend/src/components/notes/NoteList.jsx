import { useEffect, useState } from "react";
import api from "../../api/axios";
import NoteItem from "./NoteItem";

const NoteList = ({ refresh }) => {
    const [notes, setNotes] = useState([]);

    const fetchNotes = async () => {
        try {
            const res = await api.get("/notes");
            console.log("[NoteList] Fetched", res.data);
            setNotes(res.data);
        } catch (err) {
            console.error(err.response);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, [refresh]);

    const handleDeleted = (id) => {
        setNotes((prev) => prev.filter((n) => n._id !== id));
    };

    return (
        <div>
            {notes.map((note) => (
                <NoteItem key={note._id} note={note} onDeleted={handleDeleted} />
            ))}
        </div>
    );
};

export default NoteList;
