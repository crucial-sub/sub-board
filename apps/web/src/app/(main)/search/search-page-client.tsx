"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePostsQuery } from "@/hooks/usePostsQuery";
import type { PostListResponse } from "@/features/posts/types";
import { formatKoreanDateTime } from "@/lib/formatters";

type Props = {
	initialKeyword: string;
	initialResults: PostListResponse | null;
	pageSize: number;
};

export function SearchPageClient({
	initialKeyword,
	initialResults,
	pageSize,
}: Props) {
	const [keyword, setKeyword] = useState(initialKeyword);
	const [submittedKeyword, setSubmittedKeyword] = useState(initialKeyword);
	const [page, setPage] = useState(1);

	useEffect(() => {
		setKeyword(initialKeyword);
		setSubmittedKeyword(initialKeyword);
		setPage(1);
	}, [initialKeyword]);

	const trimmed = submittedKeyword.trim();
	const initialData =
		trimmed === initialKeyword && page === 1
			? initialResults ?? undefined
			: undefined;

	const { data, isFetching } = usePostsQuery({
		page,
		pageSize,
		keyword: trimmed || undefined,
		initialData,
	});

	const results = data?.items ?? [];
	const total = data?.total ?? 0;
	const hasKeyword = trimmed.length > 0;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	return (
		<section className="space-y-10">
			<header className="surface-card space-y-6 px-8 py-10">
				<div className="space-y-3">
					<p className="text-xs font-semibold uppercase tracking-[0.45em] text-brand">
						Search the board
					</p>
					<h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">
						<span className="gradient-text">게시글 검색</span>
					</h1>
					<p className="text-text-secondary">
						검색어를 입력하면 관련 게시글을 빠르게 찾아 드릴게요.
					</p>
				</div>
				<form
					className="surface-glass flex w-full flex-col gap-3 p-6 sm:flex-row sm:items-center"
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
						className="flex-1 rounded-full border border-border-muted bg-white/80 px-5 py-3 text-sm text-text-primary shadow-card focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
					/>
					<button
						type="submit"
						className="btn-gradient flex w-full justify-center sm:w-auto"
					>
						검색
					</button>
				</form>
				<p className="text-xs text-text-secondary">
					모든 게시글 보기 원하면{" "}
					<Link href="/posts" className="text-brand hover:text-brand-hover">
						게시판
					</Link>{" "}
					페이지로 이동하세요.
				</p>
			</header>

			{hasKeyword ? (
				<section className="space-y-6">
					<header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<h2 className="text-xl font-semibold text-text-primary">
							검색 결과 {total}건{isFetching ? " (불러오는 중...)" : ""}
						</h2>
						<div className="flex gap-2">
							<button
								type="button"
								disabled={page <= 1}
								onClick={() => setPage((current) => Math.max(1, current - 1))}
								className="rounded-full border border-border-muted px-3 py-1 text-sm text-text-secondary transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
							>
								이전
							</button>
							<button
								type="button"
								disabled={page >= totalPages}
								onClick={() =>
									setPage((current) =>
										current < totalPages ? current + 1 : current,
									)
								}
								className="rounded-full border border-border-muted px-3 py-1 text-sm text-text-secondary transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
							>
								다음
							</button>
						</div>
					</header>

					{results.length === 0 && !isFetching ? (
						<p className="rounded-2xl border border-dashed border-border-muted bg-white/70 px-6 py-8 text-center text-sm text-text-secondary">
							검색 결과가 없습니다. 다른 키워드로 다시 시도해 보세요.
						</p>
					) : (
						<ul className="space-y-4">
							{results.map((post) => (
								<li
									key={post.id}
									className="surface-glass transition hover:-translate-y-1 hover:border-brand/40 hover:shadow-popover"
								>
									<Link
										href={`/posts/${post.id}`}
										className="flex flex-col gap-3 p-5"
									>
										<div className="flex items-center justify-between text-xs text-text-secondary">
											<span>{post.author.nickname}</span>
											<time dateTime={post.createdAt}>
												{formatKoreanDateTime(post.createdAt)}
											</time>
										</div>
										<h3 className="text-lg font-semibold text-text-primary">
											{post.title}
										</h3>
										<p className="line-clamp-2 text-sm text-text-secondary">
											{post.content}
										</p>
									</Link>
									{post.tags?.length ? (
										<div className="flex flex-wrap gap-2 px-5 pb-5 text-[10px] text-text-secondary/70">
											{post.tags.map((tag) => (
												<span key={tag.name} className="tag">
													#{tag.name}
												</span>
											))}
										</div>
									) : null}
								</li>
							))}
						</ul>
					)}
				</section>
			) : (
				<p className="rounded-2xl border border-dashed border-border-muted bg-white/70 px-6 py-8 text-center text-sm text-text-secondary">
					검색어를 입력하면 여기에 결과가 표시됩니다.
				</p>
			)}
		</section>
	);
}
