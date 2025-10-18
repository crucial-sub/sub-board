"use client";

// 게시글을 키워드로 검색하는 페이지 컴포넌트

import { useState } from "react";
import { PostList } from "@/features/posts/components/post-list";

export default function SearchPage() {
  const [keyword, setKeyword] = useState(" ");

  return (
    <section className="space-y-6">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold text-text-primary">검색</h1>
        <p className="text-text-secondary">키워드로 게시글을 검색해 보세요.</p>
        <form
          className="flex w-full max-w-xl items-center gap-3"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <input
            type="search"
            placeholder="검색어를 입력하세요"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="flex-1 rounded-md border border-border-muted bg-white px-4 py-2 text-text-primary shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </form>
      </header>
      <PostList keyword={keyword.trim() || undefined} />
    </section>
  );
}
