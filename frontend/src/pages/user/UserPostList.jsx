import React, { useEffect, useMemo } from "react";
// 💡 표준 React 패턴: 훅과 컴포넌트를 직접 import 합니다.
// usePosts 훅은 상위 폴더의 hooks 폴더에 있다고 가정합니다. (경로 확인 필요)
import { usePosts } from "../../hooks/usePosts.js";
import UserPostItem from "./UserPostItem.jsx";
import UploadForm from "./UploadForm.jsx"; // 게시물 작성 폼을 가정

// 스타일 파일 import는 Canvas 환경에서 일반적으로 사용되지 않으므로 제거하고
// Tailwind CSS 클래스를 사용하여 디자인을 적용했습니다.

const UserPostList = ({ search = "" }) => {
    // 💡 Props 대신 직접 훅을 호출하여 데이터를 가져옵니다.
    // 'loading' 상태도 추가하여 로딩 중 UI를 표시합니다.
    const { items, load, loading, add } = usePosts();

    // 컴포넌트 마운트 시 최초 로드 (load 함수가 usePosts에서 useCallback으로 정의되어 있으므로 안전합니다.)
    useEffect(() => {
        load();
    }, [load]);

    // 검색 필터링 로직
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;
        return items.filter(
            (i) => i.title?.toLowerCase().includes(q) || i.content?.toLowerCase().includes(q)
        );
    }, [items, search]);

    // 임시 게시물 추가 핸들러 (UploadForm이 제대로 구현되기 전까지 목록 테스트용)
    const handleTestAdd = () => {
        add({
            title: `[임시] 새로운 글 #${Math.floor(Math.random() * 1000)}`,
            content: "이것은 목록 테스트를 위해 추가된 임시 게시물입니다.",
        });
    };


    return (
        <div className="p-4 sm:p-6 bg-white shadow-xl rounded-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">커뮤니티 게시판</h2>

            {/* 게시물 업로드 폼 (UploadForm은 별도의 파일로 정의해야 합니다) */}
            <div className="mb-6">
                <UploadForm />
                <button
                    onClick={handleTestAdd}
                    className="mt-2 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition duration-150"
                >
                    새 게시물 임시 추가
                </button>
            </div>


            {/* 로딩 상태 */}
            {loading && (
                <p className="text-center mt-8 text-indigo-600 animate-pulse">
                    게시물 목록을 로드하는 중입니다...
                </p>
            )}

            {/* 데이터 없음 상태 */}
            {!loading && items.length === 0 && (
                <p className="text-center mt-8 text-gray-500">
                    게시물이 없습니다. 새로운 게시물을 작성해 보세요!
                </p>
            )}

            {/* 필터링된 게시물 목록 */}
            <div className="space-y-4">
                {filtered.map((i) => (
                    // 💡 UploadForm 등 불필요한 Props 전달을 제거하고,
                    // UserPostItem은 해당 게시물(item)만 받도록 합니다.
                    <UserPostItem
                        key={i.id} // _id 대신 명시적인 id를 사용하는 것이 좋습니다. (이전 usePosts 코드 참조)
                        item={i}
                    />
                ))}
            </div>
        </div>
    );
};

export default UserPostList;
