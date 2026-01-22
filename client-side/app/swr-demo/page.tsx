'use client';

import React, { useState } from 'react';
import { usePosts, Post } from '@/hooks/usePosts';
import { Button, Card, InputField } from '@/components';

export default function SWRDemoPage() {
    const { posts, isLoading, isError, mutate } = usePosts();
    const [newPostTitle, setNewPostTitle] = useState('');

    const handleAddPost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostTitle) return;

        // Optimistic Update Data
        const optimisticPost: Post = {
            id: Date.now(),
            title: newPostTitle,
            body: 'This is a locally added post (optimistic update).',
            userId: 1,
        };

        try {
            // 1. Mutate immediately update the UI
            await mutate(
                (currentPosts) => [optimisticPost, ...(currentPosts || [])],
                false // Do not revalidate immediately
            );

            setNewPostTitle('');

            // 2. Send request to API (Mocked here since JSONPlaceholder doesn't actually save)
            // await fetch('/api/posts', { method: 'POST', ... })

            // Simulating network delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 3. Trigger revalidation to get true server state
            mutate();

        } catch (error) {
            console.error('Failed to add post', error);
            // Rollback would happen automatically if we revalidate
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">⚡ SWR Data Fetching</h1>
                <p className="text-gray-600">
                    Stale-While-Revalidate: Fast, cached, and real-time data fetching.
                </p>
            </div>

            <Card title="Add New Post (Optimistic UI)">
                <form onSubmit={handleAddPost} className="flex gap-4 items-end">
                    <InputField
                        placeholder="What's on your mind?"
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={!newPostTitle}>
                        Post
                    </Button>
                </form>
                <p className="text-xs text-gray-500 mt-2">
                    New posts appear instantly before server confirmation.
                </p>
            </Card>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Recent Posts</h2>
                    <Button variant="secondary" size="sm" onClick={() => mutate()}>
                        Refresh Data
                    </Button>
                </div>

                {isLoading && <p>Loading skeletons...</p>}
                {isError && <p className="text-red-500">Failed to load posts.</p>}

                <div className="grid gap-4">
                    {posts?.slice(0, 5).map((post: Post) => (
                        <div key={post.id} className="p-4 bg-white border rounded shadow-sm hover:shadow-md transition">
                            <h3 className="font-bold text-lg text-blue-600">{post.title}</h3>
                            <p className="text-gray-600 mt-1">{post.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
