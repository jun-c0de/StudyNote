import React, { useState, useMemo } from "react";
import { toPublicUrl } from "../../util/toPublicUrl";
import { formatYMD } from "../../util/formatYMD";
import { usePosts } from "../../hooks/usePosts";
import UploadForm from "./UploadForm";

const UserPostItem = ({ item }) => {
    const { remove, update } = usePosts();
    const [editOpen, setEditOpen] = useState(false);

    const files = useMemo(() => {
        const row = Array.isArray(item.fileUrl) ? item.fileUrl : item.fileUrl ? [item.fileUrl] : [];
        return row.map(toPublicUrl).filter(Boolean);
    }, [item]);

    const handleUpdate = async ({ title, content, file }) => {
        let key = null;
        if (file) key = await uploadToS3(file);
        await update(item._id, { title, content, fileUrl: key ? [key] : undefined });
        setEditOpen(false);
    };

    return (
        <div className="post-card">
            <h3>{item.title}</h3>
            <time>{formatYMD(item.updatedAt || item.createdAt)}</time>
            <p>{item.content}</p>
            {files.length > 0 && (
                <div className="images">
                    {files.map((src, idx) => (
                        <img key={idx} src={src} alt={`file-${idx}`} />
                    ))}
                </div>
            )}
            <button onClick={() => setEditOpen(true)}>수정</button>
            <button onClick={() => remove(item._id)}>삭제</button>
            {editOpen && (
                <UploadForm
                    initial={item}
                    onClose={() => setEditOpen(false)}
                    onUploaded={handleUpdate}
                />
            )}
        </div>
    );
};

export default UserPostItem;
