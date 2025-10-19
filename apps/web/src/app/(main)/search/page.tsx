"use client";

// 게시글을 키워드로 검색하는 페이지 컴포넌트

import { useState } from "react";
import { usePostsQuery } from "@/hooks/usePostsQuery";
import Link from "next/link";

const PAGE_SIZE = 10;

export default function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [page, setPage] = useState(1);

  const trimmed = submittedKeyword.trim();
  const { data, isFetching } = usePostsQuery({ page, pageSize: PAGE_SIZE, keyword: trimmed || undefined });
  const results = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasKeyword = trimmed.length > 0;
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  return (
    <section className="space-y-8">
      <header className="space-y-6 rounded-lg border border-border-muted bg-white p-6 shadow-card">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-text-primary">게시글 검색</h1>
          <p className="text-text-secondary">검색어를 입력하면 관련 게시글을 빠르게 찾아 드릴게요.</p>
        </div>
        <form
          className="flex w-full max-w-2xl items-center gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmittedKeyword(keyword);
            setPage(1);
          }}
        >
          <input
            type="search"
            placeholder="예: 스터디 모집"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="flex-1 rounded-md border border-border-muted bg-white px-4 py-2 text-text-primary shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            type="submit"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-hover"
          >
            검색
          </button>
        </form>
        <p className="text-xs text-text-secondary">
          모든 게시글 보기 원하면 <Link href="/posts" className="text-brand hover:text-brand-hover">게시판</Link> 페이지로 이동하세요.
        </p>
      </header>

      {hasKeyword ? (
        <section className="space-y-6">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-text-primary">
              검색 결과 {total}건{isFetching ? " (불러오는 중...)" : ""}
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-md border border-border-muted px-3 py-1 text-sm text-text-secondary transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
              >
                이전
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => (current < totalPages ? current + 1 : current))}
                className="rounded-md border border-border-muted px-3 py-1 text-sm text-text-secondary transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
              >
                다음
              </button>
            </div>
          </header>

          {results.length === 0 && !isFetching ? (
            <p className="rounded-md border border-dashed border-border-muted bg-white px-4 py-6 text-center text-sm text-text-secondary">
              검색 결과가 없습니다. 다른 키워드로 다시 시도해 보세요.
            </p>
          ) : (
            <ul className="space-y-4">
              {results.map((post) => (
                <li key={post.id} className="rounded-lg border border-border-muted bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card">
                  <Link href={`/posts/${post.id}`} className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-text-secondary">
                      <span>{post.author.nickname}</span>
                      <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleString()}</time>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary">{post.title}</h3>
                    <p className="line-clamp-2 text-sm text-text-secondary">{post.content}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <p className="rounded-md border border-dashed border-border-muted bg-white px-4 py-6 text-center text-sm text-text-secondary">
          검색어를 입력하면 여기에 결과가 표시됩니다.
        </p>
      )}
    </section>
  );
}
