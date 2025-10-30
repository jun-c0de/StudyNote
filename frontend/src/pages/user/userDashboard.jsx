import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import UploadForm from '../../pages/user/UploadForm'; // 💡 경로 변경: components/user 폴더에 생성 예정
import UserPostList from './UserPostList.jsx'; // 💡 경로 변경: components/user 폴더에 생성 예정
import { usePosts } from '../../hooks/usePosts'; // 💡 훅 생성 예정
import { uploadToS3 } from '../../api/postApi'; // 💡 postApi 함수는 임시로 가정합니다. (추후 구현 필요)

// 💡 스타일 임포트는 UserDashboard.scss로 가정합니다.
import "./style/UserDashboard.scss";

const UserDashboard = () => {
    const { user } = useAuth(); // 사용자 정보는 여전히 필요합니다!

    const [search, setSearch] = useState("");
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // usePosts 훅을 사용하여 게시물 상태 관리
    const { items, loading, load, add } = usePosts();

    // 업로드 폼에서 호출되는 최종 핸들러
    const handleUploaded = async ({ title, content, file }) => {
        try {
            console.log("[UPLOAD] step1 start", { title, content, hasFile: !!file });

            // 1. S3(또는 서버)에 파일 업로드 및 키(URL) 받기
            // 이 부분은 백엔드 구현 및 postApi 정의가 필요합니다. 임시로 uploadToS3 함수를 가정합니다.
            const key = file ? await uploadToS3(file) : null; 
            console.log("[UPLOAD] step2 s3 ok", key);

            // 2. DB에 게시물 정보 저장 (add 함수는 usePosts 훅에서 제공)
            const created = await add({ 
                title, 
                content, 
                // key가 하나이거나 없을 수 있으므로 fileKeys 배열로 처리
                fileKeys: key ? [key] : [] 
            });
            console.log("[UPLOAD] step3 db ok", created);
        } catch (e) {
            console.error("[UPLOAD] failed", e);
            throw new Error(e.message || "업로드 처리 중 오류가 발생했습니다."); // UploadForm으로 에러 전달
        }
    };

    return (
        <section className="dashboard-layout">
            <div className="inner">
                {/* 💡 환영 메시지 및 검색/업로드 영역 */}
                <h2 className='dashboard-welcome-title'>{user?.displayName || user?.email}님의 포토메모</h2>
                
                <div className="search-wrap">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder='제목, 내용, 태그로 검색해주세요'
                        className='search-input'
                    />
                    <button
                        className='btn primary upload-btn'
                        onClick={() => setIsUploadModalOpen(true)}
                    >
                        + 새 메모 업로드
                    </button>
                </div>
            </div>

            {/* 💡 게시물 목록 */}
            <div className='post-list-area'>
                <UserPostList
                    items={items}
                    loading={loading}
                    onReload={load}
                    search={search}
                />
            </div>

            {/* 💡 파일 업로드 모달 */}
            {isUploadModalOpen && (
                <UploadForm
                    onUploaded={handleUploaded}
                    onClose={() => setIsUploadModalOpen(false)}
                />
            )}
        </section>
    );
};

export default UserDashboard;
