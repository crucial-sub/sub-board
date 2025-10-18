"use client";

// 게시글 상세 정보와 댓글 목록/작성 폼을 함께 렌더링하는 컴포넌트

import { usePostDetailQuery } from "@/features/posts/hooks/usePostDetailQuery";
import { CommentForm } from "./comment-form";
import { useState } from "react";
import { useAuthGuard } from "@/features/auth/hooks/useAuthGuard";

export function PostDetail({ id }: { id: string }) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const { data, isLoading, isError } = usePostDetailQuery(id);

  if (isLoading) {
    return <p className="text-text-secondary">게시글을 불러오는 중입니다...</p>;
  }

  if (isError || !data) {
    return <p className="text-sm text-red-500">게시글을 불러오는 데 실패했습니다.</p>;
  }

  return (
    <article className="space-y-6">
      <header className="space-y-3">
        <div className="text-sm text-text-secondary">
          작성자 {data.author.nickname} · 조회수 {data.viewCount.toLocaleString()}
        </div>
        <h1 className="text-3xl font-bold text-text-primary">{data.title}</h1>
        <time className="text-xs text-text-secondary" dateTime={data.createdAt}>
          {new Date(data.createdAt).toLocaleString()}
        </time>
      </header>

      <div className="whitespace-pre-wrap rounded-lg border border-border-muted bg-white p-6 shadow-card">
        {data.content}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">댓글</h2>
          <button
            type="button"
            onClick={() => setShowCommentForm((prev) => !prev)}
            className="text-sm text-brand hover:text-brand-hover"
          >
            {showCommentForm ? "작성 취소" : "댓글 쓰기"}
          </button>
        </div>
        {showCommentForm ? <CommentForm postId={id} /> : null}
        {data.comments.length === 0 ? (
          <p className="text-sm text-text-secondary">첫 댓글을 남겨보세요.</p>
        ) : (
          <ul className="space-y-4">
            {data.comments.map((comment) => (
              <li key={comment.id} className="rounded-md border border-border-muted bg-white p-4 text-sm shadow-sm">
                <div className="mb-1 flex items-center justify-between text-xs text-text-secondary">
                  <span>{comment.author.nickname}</span>
                  <time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleString()}</time>
                </div>
                <p className="text-text-primary">{comment.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
