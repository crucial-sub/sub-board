"use client";

import { usePostsInfiniteQuery } from "@/hooks/usePostsQuery";
import { PostCard } from "./post-card";

export function PostList() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePostsInfiniteQuery();

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-lg bg-border-muted" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-red-500">게시글을 불러오는 중 오류가 발생했습니다.</p>;
  }

  if (posts.length === 0) {
    return <p className="text-text-secondary">아직 게시글이 없습니다. 첫 글을 작성해보세요!</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>

      {hasNextPage ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white shadow-card transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFetchingNextPage ? "불러오는 중..." : "더 보기"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
