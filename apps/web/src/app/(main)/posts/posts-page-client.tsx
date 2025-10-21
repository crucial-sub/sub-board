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

	return (
		<section className="space-y-8">
			<header className="surface-card space-y-6 px-8 py-10">
				<div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
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

				<div className="space-y-3">
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
							className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
								selectedTag === undefined
									? "bg-brand text-white shadow-card"
									: "border border-border-default text-text-secondary hover:border-brand hover:text-brand"
							}`}
							disabled={isTagsLoading}
						>
							전체 보기
						</button>
						{isTagsLoading ? (
							<span className="h-7 w-24 animate-pulse rounded-full border border-border-muted bg-white/60" />
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
								className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
									selectedTag === tag.name
										? "bg-brand text-white shadow-card"
										: "border border-border-default text-text-secondary hover:border-brand hover:text-brand"
								}`}
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
