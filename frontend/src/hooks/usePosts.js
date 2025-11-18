import { useCallback, useState } from "react";
import { fetchAllPosts, createPost } from "../api/postApi";

/**
 * 게시물 목록을 불러오고, 추가하는 커스텀 훅
 */
export function usePosts() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    /** 게시물 목록 로드 */
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchAllPosts();
            setItems(data);
        } catch (err) {
            console.error("게시물 로드 실패:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    /** 게시물 추가 */
    const add = useCallback(async ({ title, content, fileKeys }) => {
        try {
            const newPost = await createPost({ title, content, fileKeys });
            setItems(prev => [newPost, ...prev]);
            return newPost;
        } catch (err) {
            console.error("게시물 생성 실패:", err);
            throw err;
        }
    }, []);

    return { items, loading, load, add };
}
