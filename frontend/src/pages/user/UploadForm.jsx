import React, { useState, useEffect } from "react";

const UploadForm = ({ initial = {}, onClose, onUploaded }) => {
    const [title, setTitle] = useState(initial.title || "");
    const [content, setContent] = useState(initial.content || "");
    const [file, setFile] = useState(null);
    const isEdit = !!initial._id;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !content) {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }
        onUploaded({ title, content, file, initial });
    };

    return (
        <div className="upload-form-container">
            <div className="upload-form-modal p-6 bg-white rounded-xl shadow-2xl">
                <h3 className="text-xl font-bold mb-4">{isEdit ? "메모 수정" : "새 메모 작성"}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">제목</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">내용</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg mt-1 h-32"
                            required
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">파일 첨부 (선택)</label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                        />
                        {isEdit && <p className="text-xs text-gray-500 mt-1">새 파일을 첨부하면 기존 파일이 대체됩니다.</p>}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
                        >
                            {isEdit ? "수정 완료" : "작성"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadForm;
