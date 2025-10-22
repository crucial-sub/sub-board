// 게시글 요약 정보를 카드 형태로 보여주는 컴포넌트
import Link from "next/link";
import { formatKoreanDateTime, formatNumber } from "@/lib/formatters";

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
	const formattedCreatedAt = formatKoreanDateTime(createdAt);
	const authorInitial = author.nickname.slice(0, 1).toUpperCase();

	return (
		<article className="surface-card group relative overflow-hidden p-6 transition duration-300 hover:-translate-y-1.5 hover:shadow-popover">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] w-full scale-x-0 bg-gradient-to-r from-brand via-[var(--accent-cyan)] to-[var(--accent-pink)] transition duration-500 ease-out group-hover:scale-x-100" />
			<header className="flex items-start justify-between gap-4">
				<div className="flex items-center gap-3">
					<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-sm font-semibold text-brand shadow-[0_12px_20px_-18px_rgba(15,23,42,0.45)]">
						{authorInitial}
					</span>
					<div>
						<p className="text-sm font-semibold text-text-primary">
							{author.nickname}
						</p>
						<p className="text-xs text-text-subtle">{formattedCreatedAt}</p>
					</div>
				</div>
				<div className="flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-text-secondary shadow-[0_10px_22px_-18px_rgba(15,23,42,0.35)]">
					<span aria-hidden="true">👁</span>
					<span>{formatNumber(viewCount)}</span>
				</div>
			</header>
			<Link
				href={`/posts/${id}`}
				className="mt-5 block text-lg font-semibold leading-snug text-text-primary transition hover:text-brand"
			>
				{title}
			</Link>
			{tags?.length ? (
				<div className="mt-6 flex flex-wrap items-center gap-2">
					{tags.map((tag) => (
						<span key={tag.name} className="tag text-xs">
							<span aria-hidden="true">#</span>
							{tag.name}
						</span>
					))}
				</div>
			) : null}
		</article>
	);
}
