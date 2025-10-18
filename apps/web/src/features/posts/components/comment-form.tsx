"use client";

import { useState } from "react";
import { useCreateComment } from "../hooks/usePostMutations";

export function CommentForm({ postId }: { postId: string }) {
  const [content, setContent] = useState(" ");
  const mutation = useCreateComment(postId);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim()) return;
    await mutation.mutateAsync({ postId, content: content.trim() });
    setContent(" ");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="댓글을 입력하세요"
        className="w-full rounded-md border border-border-muted bg-white px-3 py-2 text-sm text-text-primary shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
        rows={3}
      />
      <button
        type="submit"
        disabled={mutation.isPending}
        className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-white shadow-card transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        댓글 작성
      </button>
      {mutation.error ? <p className="text-sm text-red-500">댓글 작성에 실패했습니다.</p> : null}
    </form>
  );
}
