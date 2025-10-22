import api from "../../api/axios";

const NoteItem = ({ note, onDeleted }) => {
    const handleDelete = async () => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await api.delete(`/notes/${note._id}`);
            console.log("[NoteItem] Deleted", note._id);
            onDeleted(note._id);
        } catch (err) {
            console.error(err.response);
            alert("삭제 실패");
        }
    };

    return (
        <div style={{ border: "1px solid #ccc", padding: 8, marginBottom: 8 }}>
            <h4>{note.title}</h4>
            <p>{note.content}</p>
            <button onClick={handleDelete}>삭제</button>
        </div>
    );
};

export default NoteItem;
