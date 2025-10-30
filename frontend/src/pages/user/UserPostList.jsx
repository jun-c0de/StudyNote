import React from "react";
import UserPostItem from "./UserPostItem";
// import './style/UserPostList.scss' // 💡 스타일 경로는 필요 시 설정해주세요.

/**
 * 게시물 목록을 렌더링하고 로딩/검색 상태를 처리합니다.
 */
const UserPostList = ({ items = [], loading, onReload, search }) => {

    // 💡 검색어 필터링 (프론트엔드에서 필터링하는 간단한 방식)
    const filteredItems = items.filter(item =>
    (item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.content?.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) {
        return <div className="text-center p-8 text-lg text-blue-600">게시물 로딩 중...</div>;
    }

    if (!filteredItems.length && search) {
        return <div className="text-center p-8 text-gray-500">검색 결과가 없습니다. (검색어: "{search}")</div>;
    }

    if (!filteredItems.length) {
        return (
            <div className="text-center p-8 text-gray-500">
                <p className="mb-4">아직 작성된 메모가 없습니다.</p>
                <button onClick={onReload} className="text-sm text-blue-500 hover:underline">새로고침</button>
            </div>
        );
    }


    return (
        <div className="post-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {filteredItems.map((i) => (
                <UserPostItem
                    key={i._id}
                    item={i}
                />
            ))}
        </div>
    );
};

export default UserPostList;
