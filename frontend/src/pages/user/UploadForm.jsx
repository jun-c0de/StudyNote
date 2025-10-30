import React, { useState, useRef } from 'react'
// import "./style/UploadForm.scss" // 💡 스타일 경로는 필요 시 설정해주세요.

// UploadForm을 모달 형태로 가정하고 배경(am-backdrop)과 패널(am-panel)을 사용합니다.
const UploadForm = ({
    onUploaded,
    initial,
    onClose
}) => {

    const [form, setForm] = useState({
        title: initial?.title ?? "",
        content: initial?.content ?? "",
        file: null,
        preview: null
    })

    const [uploading, setUploading] = useState(false)
    const panelRef = useRef(null)


    const handleFileChange = (e) => {

        const file = e.target.files?.[0]

        if (!file) return

        // 기존 미리보기 URL 해제 (메모리 누수 방지)
        if (form.preview) URL.revokeObjectURL(form.preview)
        const previewUrl = URL.createObjectURL(file)

        setForm((prev) => ({ ...prev, file, preview: previewUrl }))
    }

    // 💡 window.alert 대신 사용자 정의 UI를 사용해야 합니다. 여기서는 임시로 console.error로 대체합니다.
    const customAlert = (message) => {
        console.warn(`[User Alert] ${message}`);
        // 실제 프로젝트에서는 모달/토스트 메시지를 띄워야 합니다.
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("[SUBMIT] start", { form, uploading, hasOnUploaded: !!onUploaded });

        if (!form.title.trim()) {
            console.warn("[SUBMIT] title empty");
            customAlert("제목을 입력하세요.");
            return;
        }
        if (uploading) return;

        try {
            setUploading(true);

            console.log("[SUBMIT] call onUploaded");
            // 부모 컴포넌트 (UserDashboard)의 handleUploaded 함수 호출
            await onUploaded?.({
                title: form.title.trim(),
                content: form.content.trim(),
                file: form.file,
            });
            console.log("[SUBMIT] onUploaded done");

            // 성공 후 상태 초기화 및 미리보기 URL 해제
            if (form.preview) URL.revokeObjectURL(form.preview);
            setForm({ title: "", content: "", file: null, preview: null });

            // 모달 닫기
            onClose?.();
            console.log("[SUBMIT] close modal");
        } catch (err) {
            console.error("[SUBMIT] error", err);
            customAlert(err?.message || "업로드 실패");
        } finally {
            setUploading(false);
        }
    };

    // Tailwind CSS를 사용하여 기본적인 스타일링 추가 (고객님의 기존 SCSS 스타일은 유지)
    return (
        <section className='am-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <form
                ref={panelRef}
                onSubmit={handleSubmit}
                className='am-panel Upload-form bg-white p-6 rounded-xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100'
            >
                <header className='mb-6 border-b pb-3'>
                    <h2 className='text-2xl font-bold text-gray-800'>새 메모 업로드</h2>
                    <p className="sub text-sm text-gray-500">이미지와 간단한 메모를 함께 업로드 하세요</p>
                </header>
                <div className="form-grid space-y-4">
                    <div className="field">
                        <label htmlFor="title" className='block text-sm font-medium text-gray-700 mb-1'>제목</label>
                        <input
                            id='title'
                            type="text"
                            name='title'
                            value={form.title}
                            onChange={(e) => {
                                setForm((prev) => ({ ...prev, title: e.target.value }))
                            }}
                            placeholder='제목을 입력하세요'
                            className='w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="content" className='block text-sm font-medium text-gray-700 mb-1'>내용</label>
                        <textarea
                            id='content'
                            name='content'
                            value={form.content}
                            onChange={(e) => {
                                setForm((prev) => ({ ...prev, content: e.target.value }))
                            }}
                            placeholder='간단한 설명을 적어주세요'
                            rows={3}
                            className='w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none'
                        />
                    </div>
                    <div className="field">
                        <div className="file-row border border-dashed border-gray-400 p-4 rounded-lg bg-gray-50">
                            <input
                                accept='image/*'
                                type="file"
                                name='file'
                                onChange={handleFileChange}
                                className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                            />
                            {form.preview && (
                                <div className='preview-wrap mt-4 flex items-center space-x-3'>
                                    <img src={form.preview} alt="미리보기" className='preview-thumb w-20 h-20 object-cover rounded-md shadow-md' />
                                    <p className="file-name text-sm text-gray-600 truncate max-w-[200px]">{form.file?.name}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="actions flex justify-end space-x-3 mt-6">
                    <button
                        type='button'
                        className="btn ghost px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-150"
                        onClick={onClose}>
                        취소
                    </button>
                    <button
                        type='submit'
                        disabled={uploading}
                        className="btn primary px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? "업로드 중..." : "업로드"}
                    </button>
                </div>
            </form>
        </section>
    )
}

export default UploadForm
