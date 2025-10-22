import { useState } from "react";
import NoteForm from "../components/notes/NoteForm";
import NoteList from "../components/notes/NoteList";

const NotesPage = () => {
    const [refresh, setRefresh] = useState(false);

    return (
        <div>
            <h1>내 노트</h1>
            <NoteForm onSaved={() => setRefresh(!refresh)} />
            <NoteList refresh={refresh} />
        </div>
    );
};

export default NotesPage;
