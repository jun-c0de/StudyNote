import React, { useState } from "react";
import UploadForm from "./UploadForm";
import UserPostList from "./UserPostList";
import { usePosts } from "../../hooks/usePosts";
import { uploadToS3 } from "../../api/postApi";

const UserDashboard = () => {
    const { items, load, add, update } = usePosts();
    const [search, setSearch] = useState("");
    const [uploadOpen, setUploadOpen] = useState(false);

    const handleUploaded = async ({ title, content, file, initial }) => {
        let key = null;
        if (file) key = await uploadToS3(file);

        if (initial) {
            await update(initial._id, { title, content, fileUrl: key ? [key] : undefined });
        } else {
            await add({ title, content, fileKeys: key ? [key] : [] });
        }

        await load();
    };

    return (
        <section className="dashboard">
            <div className="search-wrap">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="검색어 입력"
                />
                <button className="btn primary" onClick={() => setUploadOpen(true)}>
                    업로드
                </button>
            </div>

            {uploadOpen && (
                <UploadForm
                    onClose={() => setUploadOpen(false)}
                    onUploaded={handleUploaded}
                />
            )}

            <UserPostList search={search} />
        </section>
    );
};

export default UserDashboard;
