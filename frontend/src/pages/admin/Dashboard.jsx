import { useEffect, useState } from "react";
import { fetchAllUsers, fetchAllNotes, deleteNote } from "../api/axios";

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const allUsers = await fetchAllUsers();
        const allNotes = await fetchAllNotes();
        setUsers(allUsers);
        setNotes(allNotes);
    };

    const handleDeleteNote = async (id) => {
        await deleteNote(id);
        setNotes(notes.filter(n => n._id !== id));
    };

    return (
        <div>
            <h2>관리자 대시보드</h2>

            <section>
                <h3>모든 유저</h3>
                <ul>
                    {users.map(u => (
                        <li key={u._id}>{u.displayName || u.email} ({u.role})</li>
                    ))}
                </ul>
            </section>

            <section>
                <h3>모든 노트</h3>
                <ul>
                    {notes.map(n => (
                        <li key={n._id}>
                            <b>{n.title}</b> by {n.author.displayName || n.author.email}
                            <button onClick={() => handleDeleteNote(n._id)}>삭제</button>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
};

export default AdminDashboard;
