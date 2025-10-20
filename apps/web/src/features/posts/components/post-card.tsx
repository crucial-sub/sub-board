// 게시글 요약 정보를 카드 형태로 보여주는 컴포넌트
import Link from "next/link";

export type PostCardProps = {
	id: string;
	title: string;
	viewCount: number;
	createdAt: string;
	author: {
		id: string;
		nickname: string;
	};
	tags?: Array<{
		name: string;
	}>;
};

export function PostCard({
	id,
	title,
	viewCount,
	createdAt,
	author,
	tags,
}: PostCardProps) {
	const created = new Date(createdAt);

	return (
		<article className="surface-glass group relative overflow-hidden p-5 transition hover:border-brand/60 hover:shadow-popover">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 w-full bg-gradient-to-r from-brand via-[var(--accent-cyan)] to-[var(--accent-pink)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
			<div className="flex items-center justify-between text-xs text-text-secondary">
				<span>{author.nickname}</span>
				<span>{created.toLocaleString()}</span>
			</div>
			<h2 className="mt-3 text-lg font-semibold text-text-primary">
				<Link
					href={`/posts/${id}`}
					className="transition hover:text-brand"
				>
					{title}
				</Link>
			</h2>
			<div className="mt-2 text-xs text-text-secondary">
				조회수 {viewCount.toLocaleString()}
			</div>
			{tags?.length ? (
				<div className="mt-4 flex flex-wrap gap-2 text-[10px] text-text-secondary/80">
					{tags.map((tag) => (
						<span key={tag.name} className="tag">
							#{tag.name}
						</span>
					))}
				</div>
			) : null}
		</article>
	);
}
