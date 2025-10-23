"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PostList } from "@/features/posts/components/post-list";
import { usePostsTagsQuery } from "@/features/posts/hooks/useTagsQuery";
import type {
	PostListResponse,
	PostTagSummary,
} from "@/features/posts/types";

type Props = {
	initialTag?: string;
	initialTags: PostTagSummary[];
	initialPosts: PostListResponse | null;
};

export function PostsPageClient({
	initialTag,
	initialTags,
	initialPosts,
}: Props) {
	const [page, setPage] = useState(1);
	const [selectedTag, setSelectedTag] = useState<string | undefined>(
		initialTag,
	);
	const searchParams = useSearchParams();
	const { data: tags, isLoading: isTagsLoading } = usePostsTagsQuery({
		initialData: initialTags,
	});

	useEffect(() => {
		const tagParam = searchParams?.get("tag") ?? undefined;
		const nextTag = (() => {
			if (typeof tagParam !== "string" || tagParam.length === 0) {
				return undefined;
			}
			try {
				return decodeURIComponent(tagParam);
			} catch (_error) {
				return tagParam;
			}
		})();

		setSelectedTag((prev) => {
			if (prev === nextTag) {
				return prev;
			}
			setPage(1);
			return nextTag;
		});
	}, [searchParams]);

	const tagButtons = useMemo(() => {
		if (!tags?.length) {
			return [] as Array<{ name: string; count: number }>;
		}
		return tags.map((tag) => ({ name: tag.name, count: tag.count }));
	}, [tags]);

	const initialListData =
		selectedTag === initialTag && page === 1
			? initialPosts ?? undefined
			: undefined;

	const tagButtonClass = (active: boolean) =>
		[
			"relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
			active
				? "border border-transparent bg-gradient-to-r from-brand via-accent-cyan to-brand text-white shadow-[0_18px_36px_-18px_rgba(10,132,255,0.65)]"
				: "border border-border-default bg-white/80 text-text-secondary hover:border-brand hover:text-brand",
		].join(" ");

	return (
		<div className="flex gap-6">
			{/* 왼쪽 사이드바 */}
			<aside className="hidden lg:block w-64 flex-shrink-0">
				<div className="sticky top-20 space-y-6">
					{/* 실시간 활동 */}
					<div className="surface-card p-5 space-y-3">
						<div className="flex items-center gap-2">
							<div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
							<h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
								LIVE
							</h2>
						</div>
						<p className="text-xs text-text-secondary">
							실시간으로 업데이트되는 커뮤니티 활동
						</p>
					</div>

					{/* 태그 필터 */}
					<div className="surface-card p-5 space-y-4">
						<h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
							주제 탐색
						</h2>
						<div className="space-y-2">
							<button
								type="button"
								onClick={() => {
									setSelectedTag(undefined);
									setPage(1);
								}}
								className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
									selectedTag === undefined
										? "bg-gradient-to-r from-brand to-accent-cyan text-white shadow-md"
										: "text-text-secondary hover:bg-white/60 hover:text-brand"
								}`}
								disabled={isTagsLoading}
							>
								📚 전체 보기
							</button>
							{isTagsLoading ? (
								<div className="h-8 w-full animate-pulse rounded-lg bg-white/60" />
							) : null}
							{tagButtons.map((tag) => (
								<button
									key={tag.name}
									type="button"
									onClick={() => {
										setSelectedTag((prev) =>
											prev === tag.name ? undefined : tag.name,
										);
										setPage(1);
									}}
									className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
										selectedTag === tag.name
											? "bg-gradient-to-r from-brand to-accent-cyan text-white shadow-md"
											: "text-text-secondary hover:bg-white/60 hover:text-brand"
									}`}
								>
									#{tag.name} <span className="text-xs opacity-70">({tag.count})</span>
								</button>
							))}
						</div>
					</div>

					{/* 새 글 작성 버튼 */}
					<Link href="/posts/new" className="btn-gradient w-full block text-center">
						✍️ 새 글 작성하기
					</Link>
				</div>
			</aside>

			{/* 메인 타임라인 피드 */}
			<section className="flex-1 space-y-6">
				{/* 모바일 헤더 */}
				<header className="surface-card lg:hidden relative overflow-hidden space-y-4 px-6 py-6">
					<div className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-[var(--accent-cyan)]/35 blur-[80px]" />
					<div className="relative flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
							<h1 className="text-xl font-bold gradient-text">
								라이브 피드
							</h1>
						</div>
						<Link href="/posts/new" className="btn-gradient text-sm">
							글 작성
						</Link>
					</div>
					<p className="text-xs text-text-secondary">
						{selectedTag
							? `#${selectedTag} 태그 필터링 중`
							: "최신 게시글을 실시간으로 확인하세요"}
					</p>
				</header>

				{/* 모바일 태그 필터 */}
				<div className="surface-card lg:hidden p-5 space-y-3">
					<h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
						주제 탐색
					</h2>
					<div className="flex flex-wrap gap-2">
						<button
							type="button"
							onClick={() => {
								setSelectedTag(undefined);
								setPage(1);
							}}
							className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
								selectedTag === undefined
									? "bg-gradient-to-r from-brand to-accent-cyan text-white shadow-md"
									: "border border-border-default bg-white/80 text-text-secondary hover:border-brand hover:text-brand"
							}`}
							disabled={isTagsLoading}
						>
							📚 전체
						</button>
						{isTagsLoading ? (
							<>
								<span className="h-7 w-16 animate-pulse rounded-full bg-white/60" />
								<span className="h-7 w-16 animate-pulse rounded-full bg-white/60" />
							</>
						) : null}
						{tagButtons.map((tag) => (
							<button
								key={tag.name}
								type="button"
								onClick={() => {
									setSelectedTag((prev) =>
										prev === tag.name ? undefined : tag.name,
									);
									setPage(1);
								}}
								className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
									selectedTag === tag.name
										? "bg-gradient-to-r from-brand to-accent-cyan text-white shadow-md"
										: "border border-border-default bg-white/80 text-text-secondary hover:border-brand hover:text-brand"
								}`}
							>
								#{tag.name} <span className="text-[10px] opacity-70">({tag.count})</span>
							</button>
						))}
					</div>
				</div>

				{/* 데스크톱 헤더 */}
				<header className="hidden lg:block surface-card relative overflow-hidden px-8 py-6">
					<div className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-[var(--accent-cyan)]/30 blur-[100px]" />
					<div className="relative flex items-center justify-between">
						<div className="space-y-2">
							<div className="flex items-center gap-3">
								<div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
								<h1 className="text-2xl font-bold gradient-text">
									라이브 피드 스트림
								</h1>
							</div>
							<p className="text-sm text-text-secondary">
								{selectedTag
									? `현재 #${selectedTag} 주제의 게시글을 보고 있어요`
									: "커뮤니티의 모든 학습 기록이 실시간으로 업데이트됩니다"}
							</p>
						</div>
					</div>
				</header>

				<PostList
					tag={selectedTag}
					mode="paged"
					pageSize={12}
					page={page}
					onPageChange={setPage}
					initialData={initialListData}
				/>
			</section>
		</div>
	);
}
