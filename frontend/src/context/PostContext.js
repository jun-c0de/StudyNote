// src/context/PostContext.js
import { createContext, useContext, useState, useCallback } from "react";
import * as postApi from "../api/postApi";

export const PostContext = createContext();

export const PostProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await postApi.fetchMyPosts();
            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const add = useCallback(async (post) => {
        const data = await postApi.createPost(post);
        setItems((prev) => [data, ...prev]);
        return data;
    }, []);

    const update = useCallback(async (id, patch) => {
        const data = await postApi.updatePost(id, patch);
        setItems((prev) => prev.map((i) => (i._id === id ? data : i)));
        return data;
    }, []);

    const remove = useCallback(async (id) => {
        await postApi.deletePost(id);
        setItems((prev) => prev.filter((i) => i._id !== id));
    }, []);

    return (
        <PostContext.Provider value={{ items, loading, load, add, update, remove }}>
            {children}
        </PostContext.Provider>
    );
};

export const usePosts = () => useContext(PostContext);
