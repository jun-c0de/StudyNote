import React from "react";
// import "./style/UserPostItem.scss"; // 💡 스타일 경로는 필요 시 설정해주세요.
import { useAuth } from "../../context/AuthContext"; // 사용자 ID가 필요할 수 있음

/**
 * 단일 게시물을 표시하는 카드 컴포넌트 (반응(Like/Comment) 기능 추가를 위한 구조 포함)
 * @param {object} item - 게시물 데이터
 */
const UserPostItem = ({ item }) => {
    const { user: currentUser } = useAuth(); // 현재 로그인된 사용자 정보

    // item.fileUrl은 문자열 또는 배열일 수 있습니다.
    const files = Array.isArray(item.fileUrl)
        ? item.fileUrl
        : item?.fileUrl
            ? [item.fileUrl]
            : [];

    // 임시 좋아요 상태 (실제로는 서버에서 가져와야 함)
    const isLiked = false; // item.likes.includes(currentUser._id) 라고 가정
    const likeCount = 12; // item.likes.length 라고 가정
    const commentCount = 5; // item.comments.length 라고 가정

    const handleLikeToggle = () => {
        console.log(`[ACTION] Post ID: ${item._id}에 좋아요 토글`);
        // TODO: 좋아요 API 호출 로직 추가
    };

    const handleCommentClick = () => {
        console.log(`[ACTION] Post ID: ${item._id}의 댓글 보기/작성`);
        // TODO: 댓글 모달 또는 영역 표시 로직 추가
    };

    return (
        // Tailwind CSS를 사용하여 카드 스타일링
        <div className="post-card bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100 mb-6">
            <div className="p-4">
                <div className="file-card-head flex justify-between items-start border-b pb-3 mb-3">
                    <div className="left flex items-center space-x-3">
                        {/* 작성자 정보 (임시) */}
                        <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {item.author?.displayName?.[0] || 'U'}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">{item?.title ?? "제목 없음"}</h3>
                            <span className="text-xs text-gray-500">작성자: {item.author?.displayName || 'Unknown'}</span>
                        </div>
                    </div>
                    <div className="file-card-meta text-right">
                        {item?.updateAt && (
                            <time className="file-card-time text-xs text-gray-500">
                                {new Date(item.updateAt).toLocaleDateString()}
                            </time>
                        )}
                        {/* 게시물 번호 (옵션) */}
                        {(item?.number ?? "") !== "" && <span className="block text-xs text-gray-400">No. {item.number}</span>}
                    </div>
                </div>

                <div className="file-card-details space-y-4">
                    {files?.length > 0 && (
                        <div className="file-card-image max-h-80 overflow-hidden rounded-lg">
                            {files.slice(0, 1).map((src, idx) => ( // 첫 번째 이미지 하나만 표시
                                <img
                                    key={idx}
                                    // S3 키가 아닌 완전한 URL이 들어와야 합니다. (이 부분은 usePosts에서 처리 가정)
                                    src={src}
                                    alt={`file-${idx}`}
                                    className="w-full h-auto object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/CCCCCC/000000?text=Image+Not+Found"; }}
                                />
                            ))}
                        </div>
                    )}
                    {item?.content && <p className="file-card-content text-gray-700 leading-relaxed">{item.content}</p>}
                </div>
            </div>

            {/* 💡 좋아요/댓글 반응 영역 */}
            <div className="file-card-actions border-t p-4 flex justify-around text-gray-500 text-sm">
                <button
                    onClick={handleLikeToggle}
                    className={`flex items-center space-x-1 p-2 rounded-full transition duration-200 ${isLiked ? 'text-red-500 bg-red-50' : 'hover:bg-gray-100'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        {isLiked ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" fill="none" />
                        )}
                    </svg>
                    <span>{likeCount} 좋아요</span>
                </button>

                <button
                    onClick={handleCommentClick}
                    className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100 transition duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.155A12.023 12.023 0 0112 10.5h1.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{commentCount} 댓글</span>
                </button>
            </div>
        </div>
    );
};

export default UserPostItem;
