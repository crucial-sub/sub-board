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
		<section className="space-y-8">
			<header className="surface-card relative overflow-hidden space-y-6 px-10 py-12">
				<div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-[var(--accent-cyan)]/35 blur-[110px]" />
				<div className="pointer-events-none absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-[var(--accent-pink)]/35 blur-[110px]" />
				<div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
					<div className="space-y-3">
						<p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand">
							Community Feed
						</p>
						<h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">
							<span className="gradient-text">게시판 라이브 스트림</span>
						</h1>
						<p className="max-w-2xl text-sm text-text-secondary">
							{selectedTag
								? `현재 #${selectedTag} 태그에 맞춘 게시글을 보고 있어요.`
								: "인기 태그와 최신 게시글을 한눈에 살펴보세요."}
						</p>
					</div>
					<Link href="/posts/new" className="btn-gradient">
						새 글 작성하기
					</Link>
				</div>

				<div className="relative space-y-3">
					<p className="text-xs font-medium uppercase tracking-[0.3em] text-text-subtle">
						태그 필터링
					</p>
					<div className="flex flex-wrap gap-3">
						<button
							type="button"
							onClick={() => {
								setSelectedTag(undefined);
								setPage(1);
							}}
							className={tagButtonClass(selectedTag === undefined)}
							disabled={isTagsLoading}
						>
							전체 보기
						</button>
						{isTagsLoading ? (
							<span className="h-8 w-28 animate-pulse rounded-full border border-border-muted bg-white/60" />
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
								className={tagButtonClass(selectedTag === tag.name)}
							>
								#{tag.name} ({tag.count})
							</button>
						))}
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
	);
}
