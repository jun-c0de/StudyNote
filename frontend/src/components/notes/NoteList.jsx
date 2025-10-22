import NoteItem from "./NoteItem";

const NoteList = ({ notes, onUpdate, onDelete }) => {
    return (
        <ul>
            {notes.map(note => (
                <NoteItem
                    key={note._id}
                    note={note}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                />
            ))}
        </ul>
    );
};

export default NoteList;
