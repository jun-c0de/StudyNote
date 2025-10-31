import React, { useState, useRef } from 'react'
// postApi.js 파일에서 S3 관련 API 함수를 불러옵니다.
import { getPresignedUrl, uploadFileToS3 } from '../../api/postApi';

// UploadForm을 모달 형태로 가정하고 배경(am-backdrop)과 패널(am-panel)을 사용합니다.
const UploadForm = ({
    onUploaded, // 최종적으로 업로드된 S3 URL과 제목/내용을 처리하는 부모 함수
    initial,
    onClose
}) => {

    const [form, setForm] = useState({
        title: initial?.title ?? "",
        content: initial?.content ?? "",
        file: null,
        preview: null
    });

    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState(""); // 업로드 진행 상황 메시지
    const panelRef = useRef(null);

    // 사용자 정의 알림 메시지를 설정합니다.
    const customAlert = (message) => {
        setUploadMessage(`⚠️ ${message}`);
        setTimeout(() => setUploadMessage(""), 5000); // 5초 후 메시지 제거
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        // 파일 유효성 검사 (예: 이미지 파일만 허용)
        if (!file.type.match('image/.*')) {
            customAlert("이미지 파일만 업로드할 수 있습니다.");
            return;
        }

        // 기존 미리보기 URL 해제 (메모리 누수 방지)
        if (form.preview) URL.revokeObjectURL(form.preview);
        const previewUrl = URL.createObjectURL(file);

        setForm((prev) => ({ ...prev, file, preview: previewUrl }));
        setUploadMessage(''); // 파일 선택 시 메시지 초기화
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            customAlert("제목을 입력하세요.");
            return;
        }
        if (!form.file) {
            customAlert("업로드할 파일을 선택해 주세요.");
            return;
        }
        if (uploading) return;

        let finalS3Url = null;

        try {
            setUploading(true);
            setUploadMessage("파일 업로드 준비 중...");

            // --- S3 업로드 로직 시작: postApi.js를 호출하여 백엔드 및 S3와 통신 ---

            // 1. 백엔드에서 Presigned URL 요청
            setUploadMessage("Presigned URL 요청 중...");
            const presignedUrl = await getPresignedUrl(form.file.name, form.file.type);

            // 2. Presigned URL을 사용하여 S3에 직접 파일 업로드
            setUploadMessage("S3에 파일 업로드 중...");
            await uploadFileToS3(presignedUrl, form.file, form.file.type);

            // 3. S3 URL 추출 (Presigned URL에서 쿼리스트링 제거)
            const urlObject = new URL(presignedUrl);
            finalS3Url = urlObject.origin + urlObject.pathname;

            // --- S3 업로드 로직 끝 ---

            setUploadMessage("업로드 성공! 데이터 저장 중...");

            // 4. 부모 컴포넌트의 onUploaded 함수 호출 (S3 URL 포함)
            await onUploaded?.({
                title: form.title.trim(),
                content: form.content.trim(),
                fileUrl: finalS3Url, // S3에 저장된 최종 URL을 전달
            });

            setUploadMessage("✅ 메모 업로드가 완료되었습니다.");

            // 성공 후 상태 초기화 및 미리보기 URL 해제
            if (form.preview) URL.revokeObjectURL(form.preview);

            // 5. 모달 닫기
            setTimeout(() => {
                setForm({ title: "", content: "", file: null, preview: null });
                onClose?.();
            }, 1000); // 성공 메시지를 잠시 보여준 후 닫기

        } catch (err) {
            console.error("[SUBMIT] error", err);
            customAlert(err?.message || "업로드 실패. 다시 시도해 주세요.");
        } finally {
            // 업로드 성공/실패와 관계없이 로딩 상태 해제
            setUploading(false);
        }
    };

    // Tailwind CSS를 사용하여 기본적인 스타일링
    return (
        <section className='am-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-sans'>
            <form
                ref={panelRef}
                onSubmit={handleSubmit}
                // 패널 스타일: 모바일 환경에서 적절한 크기를 갖도록 조정
                className='am-panel Upload-form bg-white p-6 rounded-xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100'
            >
                <header className='mb-6 border-b pb-3'>
                    <h2 className='text-2xl font-bold text-gray-800'>새 메모 업로드</h2>
                    <p className="sub text-sm text-gray-500">이미지와 간단한 메모를 함께 업로드 하세요</p>
                </header>
                <div className="form-grid space-y-4">
                    {/* 제목 입력 필드 */}
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
                    {/* 내용 입력 필드 */}
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
                    {/* 파일 선택 및 미리보기 */}
                    <div className="field">
                        <div className="file-row border border-dashed border-gray-400 p-4 rounded-lg bg-gray-50">
                            <label className='block text-sm font-medium text-gray-700 mb-3'>파일 선택 (이미지)</label>
                            <input
                                accept='image/*'
                                type="file"
                                name='file'
                                onChange={handleFileChange}
                                className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                                disabled={uploading}
                            />
                            {form.preview && (
                                <div className='preview-wrap mt-4 flex items-center space-x-3 p-2 bg-white rounded-md shadow-inner'>
                                    <img src={form.preview} alt="미리보기" className='preview-thumb w-16 h-16 object-cover rounded-md shadow-md' />
                                    <p className="file-name text-sm text-gray-600 truncate flex-grow">{form.file?.name}</p>
                                    <button
                                        type='button'
                                        onClick={() => {
                                            URL.revokeObjectURL(form.preview);
                                            setForm(prev => ({ ...prev, file: null, preview: null }));
                                        }}
                                        className='text-red-500 hover:text-red-700 p-1 rounded-full bg-red-100 transition duration-150'
                                    >
                                        <X className='w-4 h-4' />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 업로드 메시지 */}
                {(uploading || uploadMessage) && (
                    <div className={`mt-4 p-3 rounded-lg font-medium flex items-center space-x-3 
                        ${uploading ? 'bg-blue-50 text-blue-700' :
                            uploadMessage.startsWith('⚠️') ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`
                    }>
                        {uploading && <Loader2 className="w-5 h-5 animate-spin" />}
                        <span>{uploadMessage}</span>
                    </div>
                )}


                {/* 액션 버튼 */}
                <div className="actions flex justify-end space-x-3 mt-6">
                    <button
                        type='button'
                        className="btn ghost px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-150"
                        onClick={onClose}
                        disabled={uploading}>
                        취소
                    </button>
                    <button
                        type='submit'
                        disabled={uploading || !form.file || !form.title.trim()}
                        className="btn primary px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {uploading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        <span>{uploading ? "업로드 중..." : "업로드"}</span>
                    </button>
                </div>
            </form>
        </section>
    )
}

export default UploadForm
