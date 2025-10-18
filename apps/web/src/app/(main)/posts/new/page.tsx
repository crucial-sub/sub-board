"use client";

import { useState } from "react";
import { useCreatePost } from "@/features/posts/hooks/usePostMutations";
import { useAuthGuard } from "@/features/auth/hooks/useAuthGuard";

export default function NewPostPage() {
  useAuthGuard();
  const [title, setTitle] = useState(" ");
  const [content, setContent] = useState(" ");
  const mutation = useCreatePost();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;
    await mutation.mutateAsync({ title: title.trim(), content: content.trim() });
    setTitle(" ");
    setContent(" ");
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-text-primary">새 글 작성</h1>
        <p className="text-text-secondary">게시판에 공유하고 싶은 내용을 작성하세요.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary" htmlFor="title">
            제목
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-md border border-border-muted bg-white px-4 py-2 text-text-primary shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary" htmlFor="content">
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="min-h-[200px] w-full rounded-md border border-border-muted bg-white px-4 py-2 text-text-primary shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            required
          />
        </div>

        {mutation.error ? <p className="text-sm text-red-500">게시글 작성에 실패했습니다.</p> : null}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white shadow-card transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          작성하기
        </button>
      </form>
    </section>
  );
}
