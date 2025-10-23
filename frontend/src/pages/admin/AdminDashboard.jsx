import { useEffect, useState } from "react";
import api from "../../api/axios";

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        loadUsers();
        loadNotes();
    }, []);

    const loadUsers = async () => {
        try {
            const { data } = await api.get("/api/admin/users");
            setUsers(data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadNotes = async () => {
        try {
            const { data } = await api.get("/api/admin/notes");
            setNotes(data);
        } catch (err) {
            console.error(err);
        }
    };

    const deleteUser = async id => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        await api.delete(`/api/admin/users/${id}`);
        setUsers(users.filter(u => u._id !== id));
    };

    const deleteNote = async id => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        await api.delete(`/api/admin/notes/${id}`);
        setNotes(notes.filter(n => n._id !== id));
    };

    return (
        <div>
            <h2>관리자 대시보드</h2>

            <section>
                <h3>유저 관리</h3>
                <table border={1} cellPadding={5}>
                    <thead>
                        <tr>
                            <th>닉네임</th>
                            <th>이메일</th>
                            <th>역할</th>
                            <th>액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u._id}>
                                <td>{u.displayName}</td>
                                <td>{u.email}</td>
                                <td>{u.role}</td>
                                <td>
                                    <button onClick={() => deleteUser(u._id)}>삭제</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section style={{ marginTop: "2rem" }}>
                <h3>노트 관리</h3>
                <table border={1} cellPadding={5}>
                    <thead>
                        <tr>
                            <th>제목</th>
                            <th>작성자</th>
                            <th>공유 대상</th>
                            <th>액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notes.map(n => (
                            <tr key={n._id}>
                                <td>{n.title}</td>
                                <td>{n.owner.displayName}</td>
                                <td>{n.sharedWith?.map(u => u.displayName).join(", ") || "없음"}</td>
                                <td>
                                    <button onClick={() => deleteNote(n._id)}>삭제</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default AdminDashboard;
