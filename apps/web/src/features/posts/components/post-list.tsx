"use client";

// 게시글 목록을 조회하고 무한 스크롤/검색을 처리하는 컴포넌트
import { usePostsInfiniteQuery } from "@/hooks/usePostsQuery";
import { PostCard } from "./post-card";

// 로딩 상태에서 사용할 스켈레톤 카드의 고정 키 목록
const LOADING_SKELETON_KEYS = ["skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4"];

export function PostList({ keyword }: { keyword?: string }) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePostsInfiniteQuery({ keyword });

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {LOADING_SKELETON_KEYS.map((key) => (
          <div key={key} className="h-24 animate-pulse rounded-lg bg-border-muted" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-red-500">게시글을 불러오는 중 오류가 발생했습니다.</p>;
  }

  if (posts.length === 0) {
    return <p className="text-text-secondary">검색 결과가 없습니다.</p>;
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
