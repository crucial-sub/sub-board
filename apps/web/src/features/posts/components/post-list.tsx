"use client";

// 게시글 목록을 조회하고 무한 스크롤/검색을 처리하는 컴포넌트
import { useMemo, useState } from "react";
import { usePostsInfiniteQuery, usePostsQuery } from "@/hooks/usePostsQuery";
import type { PostListResponse } from "@/features/posts/types";
import { PostCard } from "./post-card";

// 로딩 상태에서 사용할 스켈레톤 카드의 고정 키 목록
const LOADING_SKELETON_KEYS = [
	"skeleton-1",
	"skeleton-2",
	"skeleton-3",
	"skeleton-4",
];

export function PostList({
	keyword,
	tag,
	mode = "infinite",
	pageSize = 12,
	page,
	onPageChange,
	initialData,
}: {
	keyword?: string;
	tag?: string;
	mode?: "infinite" | "paged";
	pageSize?: number;
	page?: number;
	onPageChange?: (page: number) => void;
	initialData?: PostListResponse;
}) {
	if (mode === "paged") {
		return (
			<PagedPostList
				keyword={keyword}
				tag={tag}
				pageSize={pageSize}
				page={page}
				onPageChange={onPageChange}
				initialData={initialData}
			/>
		);
	}

	return <InfinitePostList keyword={keyword} tag={tag} />;
}

function InfinitePostList({
	keyword,
	tag,
}: {
	keyword?: string;
	tag?: string;
}) {
	const {
		data,
		isLoading,
		isError,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = usePostsInfiniteQuery({ keyword, tag });

	const posts = data?.pages.flatMap((page) => page.items) ?? [];

	if (isLoading) {
		return (
			<div className="timeline-container">
				{LOADING_SKELETON_KEYS.map((key) => (
					<div
						key={key}
						className="h-40 animate-pulse rounded-2xl bg-gradient-to-br from-white/60 via-white/40 to-white/70 shadow-md"
					/>
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<p className="rounded-2xl border border-red-200/70 bg-red-50/80 px-5 py-4 text-sm text-red-500 shadow-sm">
				게시글을 불러오는 중 오류가 발생했습니다.
			</p>
		);
	}

	if (posts.length === 0) {
		return (
			<p className="rounded-2xl border border-border-muted bg-white/80 px-6 py-10 text-center text-sm text-text-secondary shadow-sm">
				표시할 게시글이 없습니다.
			</p>
		);
	}

	return (
		<div className="space-y-6">
			<div className="timeline-container">
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
						className="btn-gradient disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isFetchingNextPage ? "불러오는 중..." : "더 보기"}
					</button>
				</div>
			) : null}
		</div>
	);
}

function PagedPostList({
	keyword,
	tag,
	pageSize,
	page: controlledPage,
	onPageChange,
	initialData,
}: {
	keyword?: string;
	tag?: string;
	pageSize: number;
	page?: number;
	onPageChange?: (page: number) => void;
	initialData?: PostListResponse;
}) {
	const [internalPage, setInternalPage] = useState(1);
	const isControlled =
		typeof controlledPage === "number" && typeof onPageChange === "function";
	const activePage = isControlled ? (controlledPage as number) : internalPage;
	const setPage = isControlled
		? (onPageChange as (page: number) => void)
		: setInternalPage;

	const trimmedKeyword = keyword?.trim() ?? "";

	const { data, isLoading, isError } = usePostsQuery({
		page: activePage,
		pageSize,
		keyword: trimmedKeyword ? trimmedKeyword : undefined,
		tag,
		initialData,
	});
	const posts = data?.items ?? [];
	const total = data?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageNumbers = useMemo(() => {
		const MAX_VISIBLE = 5;
		const half = Math.floor(MAX_VISIBLE / 2);
		let start = Math.max(1, activePage - half);
		let end = start + MAX_VISIBLE - 1;
		if (end > totalPages) {
			end = totalPages;
			start = Math.max(1, end - MAX_VISIBLE + 1);
		}
		return Array.from({ length: end - start + 1 }, (_, index) => start + index);
	}, [activePage, totalPages]);

	if (isLoading) {
		return (
			<div className="timeline-container">
				{LOADING_SKELETON_KEYS.map((key) => (
					<div
						key={key}
						className="h-40 animate-pulse rounded-2xl bg-gradient-to-br from-white/60 via-white/40 to-white/70 shadow-md"
					/>
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<p className="rounded-2xl border border-red-200/70 bg-red-50/80 px-5 py-4 text-sm text-red-500 shadow-sm">
				게시글을 불러오는 중 오류가 발생했습니다.
			</p>
		);
	}

	if (posts.length === 0) {
		return (
			<p className="rounded-2xl border border-border-muted bg-white/80 px-6 py-10 text-center text-sm text-text-secondary shadow-sm">
				표시할 게시글이 없습니다.
			</p>
		);
	}

	return (
		<div className="space-y-6">
			<div className="timeline-container">
				{posts.map((post) => (
					<PostCard key={post.id} {...post} />
				))}
			</div>

			<div className="flex items-center justify-center gap-2">
				<button
					type="button"
					onClick={() => setPage(Math.max(1, activePage - 1))}
					disabled={activePage === 1}
					className="rounded-lg border border-border-muted bg-white/70 px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-brand hover:bg-brand/5 hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
				>
					← 이전
				</button>
				{pageNumbers.map((pageNumber) => (
					<button
						key={pageNumber}
						type="button"
						onClick={() => setPage(pageNumber)}
						className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
							pageNumber === activePage
								? "bg-gradient-to-r from-brand to-accent-cyan text-white shadow-md"
								: "border border-border-muted bg-white/70 text-text-secondary hover:border-brand hover:bg-brand/5 hover:text-brand"
						}`}
					>
						{pageNumber}
					</button>
				))}
				<button
					type="button"
					onClick={() => setPage(Math.min(totalPages, activePage + 1))}
					disabled={activePage === totalPages}
					className="rounded-lg border border-border-muted bg-white/70 px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-brand hover:bg-brand/5 hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
				>
					다음 →
				</button>
			</div>
		</div>
	);
}
