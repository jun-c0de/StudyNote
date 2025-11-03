import React, { useState, useEffect } from "react";
import { toPublicUrl } from "../../util/toPublicUrl";

const UploadForm = ({ initial, onClose, onUploaded }) => {
    const [form, setForm] = useState({
        title: initial?.title ?? "",
        content: initial?.content ?? "",
        file: null,
        preview: initial?.fileUrl ? toPublicUrl(initial.fileUrl[0]) : null,
    });
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

    // blob cleanup
    useEffect(() => {
        return () => {
            if (form.preview?.startsWith("blob:")) URL.revokeObjectURL(form.preview);
        };
    }, [form.preview]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (form.preview?.startsWith("blob:")) URL.revokeObjectURL(form.preview);
        setForm({ ...form, file, preview: URL.createObjectURL(file) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return setMessage("제목을 입력해주세요.");
        if (uploading) return;

        try {
            setUploading(true);
            await onUploaded({
                title: form.title.trim(),
                content: form.content.trim(),
                file: form.file,
            });
            setMessage("업로드 완료!");
            setForm({ title: "", content: "", file: null, preview: null });
            onClose();
        } catch (err) {
            console.error(err);
            setMessage(err.message || "업로드 실패");
        } finally {
            setUploading(false);
        }
    };

    return (
        <section className="am-backdrop">
            <form className="am-panel Upload-form" onSubmit={handleSubmit}>
                <h2>{initial ? "수정" : "새 업로드"}</h2>
                <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="제목"
                />
                <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="내용"
                    rows={3}
                />
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {form.preview && <img src={form.preview} alt="미리보기" />}
                <div>{message}</div>
                <button type="submit" disabled={uploading}>
                    {uploading ? "업로드 중..." : "업로드"}
                </button>
                <button type="button" onClick={onClose}>
                    취소
                </button>
            </form>
        </section>
    );
};

export default UploadForm;
