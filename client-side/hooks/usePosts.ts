import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export interface Post {
    id: number;
    title: string;
    body: string;
    userId: number;
}

const API_URL = 'https://jsonplaceholder.typicode.com/posts';

export function usePosts() {
    const { data, error, isLoading, mutate } = useSWR<Post[]>(API_URL, fetcher);

    return {
        posts: data,
        isLoading,
        isError: error,
        mutate,
    };
}

export function usePost(id: number | null) {
    const { data, error, isLoading } = useSWR<Post>(
        id ? `${API_URL}/${id}` : null,
        fetcher
    );

    return {
        post: data,
        isLoading,
        isError: error,
    };
}
