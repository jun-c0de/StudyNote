// Mocking the API functions required by usePosts.js
// 실제 백엔드 호출 대신 더미 데이터를 반환합니다.

/**
 * 모든 공개 게시물 목록을 가져오는 Mock API입니다.
 * @returns {Promise<Array<Object>>} 게시물 목록
 */
export async function fetchAllPosts() {
    await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 효과 딜레이

    const mockPosts = [
        {
            id: 101,
            title: "커뮤니티 환영 게시물",
            content: "파일 분리 요청대로 코드를 수정하고, 이제 API Mock을 추가합니다.",
            updatedAt: new Date().toISOString(),
            author: { displayName: "관리자" }
        },
        {
            id: 102,
            title: "게시물 로드 테스트",
            content: "usePosts 훅을 통해 데이터를 성공적으로 가져왔습니다.",
            updatedAt: new Date(Date.now() - 86400000).toISOString(), // 하루 전
            author: { displayName: "사용자 A" }
        }
    ];

    return mockPosts;
}

/**
 * 새 게시물을 생성하는 Mock API입니다.
 * @param {Object} postData 생성할 게시물 데이터
 * @returns {Promise<Object>} 생성된 게시물 객체
 */
export async function createPost({ title, content, fileKeys }) {
    await new Promise(resolve => setTimeout(resolve, 300)); // 딜레이

    const newPost = {
        id: Date.now(),
        title: title,
        content: content,
        updatedAt: new Date().toISOString(),
        author: { displayName: "새 작성자" }, // 임시 작성자 정보
        fileKeys: fileKeys,
    };

    console.log("Mock API: 새 게시물 생성됨", newPost);
    return newPost;
}
