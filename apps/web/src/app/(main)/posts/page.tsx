"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PostList } from "@/features/posts/components/post-list";
import { usePostsTagsQuery } from "@/features/posts/hooks/useTagsQuery";

export default function PostsPage() {
	const [page, setPage] = useState(1);
	const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
	const { data: tags, isLoading: isTagsLoading } = usePostsTagsQuery();
	const searchParams = useSearchParams();

	useEffect(() => {
		const nextTag = searchParams?.get("tag") ?? undefined;
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

	return (
		<section className="space-y-6">
			<header className="space-y-5">
				<div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
					<div className="space-y-2">
						<h1 className="text-3xl font-bold text-text-primary">게시판</h1>
						<p className="text-text-secondary">
							최신 글을 확인하고 관심 있는 태그로 필터링해보세요.{" "}
							{selectedTag
								? `현재 선택된 태그: #${selectedTag}`
								: "전체 게시글을 보여주는 중입니다."}
						</p>
					</div>
					<Link
						href="/posts/new"
						className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-hover"
					>
						새 글 작성하기
					</Link>
				</div>

				<div className="space-y-2">
					<p className="text-xs font-medium text-text-secondary">
						태그로 필터링
					</p>
					<div className="flex flex-wrap gap-2">
						<button
							type="button"
							onClick={() => {
								setSelectedTag(undefined);
								setPage(1);
							}}
							className={`rounded-full px-3 py-1 text-xs transition ${
								selectedTag === undefined
									? "bg-brand text-white shadow-card"
									: "border border-border-muted text-text-secondary hover:border-brand hover:text-brand"
							}`}
							disabled={isTagsLoading}
						>
							전체 보기
						</button>
						{isTagsLoading ? (
							<span className="h-5 w-24 animate-pulse rounded bg-border-muted" />
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
								className={`rounded-full px-3 py-1 text-xs transition ${
									selectedTag === tag.name
										? "bg-brand text-white shadow-card"
										: "border border-border-muted text-text-secondary hover:border-brand hover:text-brand"
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
			/>
		</section>
	);
}
