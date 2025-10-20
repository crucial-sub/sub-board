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
		<article className="space-y-3 rounded-lg border border-border-muted bg-white p-5 shadow-card transition hover:shadow-popover">
			<div className="flex items-center justify-between text-xs text-text-secondary">
				<span>{author.nickname}</span>
				<span>{created.toLocaleString()}</span>
			</div>
			<h2 className="text-lg font-semibold text-text-primary">
				<Link href={`/posts/${id}`}>{title}</Link>
			</h2>
			<div className="text-xs text-text-secondary">
				조회수 {viewCount.toLocaleString()}
			</div>
			{tags?.length ? (
				<div className="flex flex-wrap gap-2 text-[10px] text-text-tertiary">
					{tags.map((tag) => (
						<span
							key={tag.name}
							className="rounded-full border border-border-muted px-2 py-0.5"
						>
							#{tag.name}
						</span>
					))}
				</div>
			) : null}
		</article>
	);
}
