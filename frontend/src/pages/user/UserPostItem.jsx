import React, { useState, useMemo } from "react";
// 필요한 Mock 함수와 훅을 App.jsx에서 제공한다고 가정하고, 여기서는 주석 처리합니다.
// import { usePosts } from "../../hooks/usePosts";
// import UploadForm from "./UploadForm";

// App.jsx에서 Mock 함수를 받아 사용하기 위해 props를 통해 전달받는 것으로 변경하거나,
// App.jsx에서 Mock된 컴포넌트와 훅을 인라인으로 정의합니다.
// 여기서는 코드를 독립적으로 유지하기 위해 Mock 함수를 주석 처리된 상태로 유지합니다.

// Mock for formatYMD and uploadToS3 (실제 환경에서는 import 됩니다)
const formatYMD = (date) => new Date(date).toLocaleDateString("ko-KR");
const uploadToS3 = async (file) => {
    console.log(`Mock S3 Upload: ${file.name}`);
    return "mock-s3-key-" + Date.now();
};
const toPublicUrl = (key) => `https://placehold.co/100x100/38b2ac/white?text=${key.substring(14)}`;


const UserPostItem = ({ item, usePosts, UploadForm }) => {
    const { remove, update } = usePosts();
    const [editOpen, setEditOpen] = useState(false);

    const files = useMemo(() => {
        // item.fileUrl 대신 item.fileKeys를 사용하는 것이 일반적이지만, 사용자님의 코드를 존중하여 수정
        const row = Array.isArray(item.fileUrl) ? item.fileUrl : item.fileUrl ? [item.fileUrl] : [];
        return row.map(toPublicUrl).filter(Boolean);
    }, [item]);

    const handleUpdate = async ({ title, content, file }) => {
        let key = null;
        if (file) key = await uploadToS3(file);

        // 파일 업로드 키를 fileUrl 필드에 배열로 저장한다고 가정합니다.
        await update(item._id, { title, content, fileUrl: key ? [key] : item.fileUrl });
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
            <div className="button-group">
                <button onClick={() => setEditOpen(true)}>수정</button>
                <button onClick={() => remove(item._id)}>삭제</button>
            </div>

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
