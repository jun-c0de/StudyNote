import { useState, useCallback, useEffect } from "react";
// 💡 fetchMyPosts 대신 모든 공개 게시물을 가져오는 API 함수(fetchAllPosts)를 사용한다고 가정합니다.
//    실제 API 파일(postApi)에서 이 함수를 구현해주세요.
import { createPost, fetchAllPosts } from "../api/postApi.js";

export function usePosts() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    /**
     * 모든 공개 게시물을 서버에서 불러옵니다.
     * 커뮤니티 게시판을 위해 fetchAllPosts를 사용합니다.
     */
    const load = useCallback(async () => {
        setLoading(true);

        try {
            // fetchAllPosts를 호출하여 모든 공개 게시물 목록을 가져옵니다.
            const list = await fetchAllPosts();

            // UserPostItem에서 필요한 author와 updateAt 포맷을 위해 데이터를 가공합니다.
            const formattedList = list.map(item => ({
                ...item,
                // 작성자 정보가 백엔드에서 제공되지 않으면 임시값 사용
                author: item.author || { displayName: '익명 사용자' },
                // 날짜 포맷 (updateAt이 없을 경우 빈 문자열)
                updateAt: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('ko-KR') : '',
            }));

            setItems(formattedList);
        } catch (error) {
            console.error("게시물 로드 실패:", error);
            // 에러 발생 시에도 로딩 상태는 해제
        } finally {
            setLoading(false);
        }
    }, []); // 의존성 배열 비움

    /**
     * 새 게시물을 생성하고 목록에 추가합니다.
     */
    const add = useCallback(async ({ title, content, fileKeys = [] }) => {
        // created 변수는 서버로부터 받은 완전히 생성된 게시물 객체입니다.
        const created = await createPost({ title, content, fileKeys });

        // UserPostItem과의 호환성을 위해 추가된 게시물 데이터도 가공합니다.
        const formattedCreated = {
            ...created,
            author: created.author || { displayName: '익명 사용자' },
            updateAt: created.updatedAt ? new Date(created.updatedAt).toLocaleDateString('ko-KR') : '',
        };

        // 새로 생성된 게시물을 목록 맨 앞에 추가
        setItems((prev) => [formattedCreated, ...prev]);

        return created;
    }, []);

    // 컴포넌트 마운트 시 최초 로드
    useEffect(() => {
        load();
    }, [load]);

    return {
        items,
        loading,
        load,
        add,
    };
}
