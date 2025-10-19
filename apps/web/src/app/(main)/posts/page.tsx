"use client";

// 게시판 목록 페이지와 검색 입력 UI

import Link from "next/link";
import { useState } from "react";
import { PostList } from "@/features/posts/components/post-list";

const QUICK_KEYWORDS = ["공지", "업데이트", "Q&A", "자유", "스터디"];

export default function PostsPage() {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  return (
    <section className="space-y-6">
      <header className="space-y-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-text-primary">게시판</h1>
            <p className="text-text-secondary">최신 글을 확인하고 원하는 주제를 빠르게 찾아보세요.</p>
          </div>
          <Link
            href="/posts/new"
            className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-hover"
          >
            새 글 작성하기
          </Link>
        </div>
        <form
          className="flex w-full max-w-2xl items-center gap-3"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <input
            type="search"
            placeholder="검색어를 입력하세요"
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(1);
            }}
            className="flex-1 rounded-md border border-border-muted bg-white px-4 py-2 text-text-primary shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            type="submit"
            className="rounded-md border border-border-muted bg-white px-4 py-2 text-sm font-semibold text-text-primary shadow-sm transition hover:border-brand hover:text-brand"
          >
            검색하기
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {QUICK_KEYWORDS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setKeyword(item);
                setPage(1);
              }}
              className="rounded-full border border-border-muted px-3 py-1 text-xs text-text-secondary transition hover:border-brand hover:text-brand"
            >
              #{item}
            </button>
          ))}
        </div>
      </header>

      <PostList keyword={keyword} mode="paged" pageSize={12} page={page} onPageChange={setPage} />
    </section>
  );
}
