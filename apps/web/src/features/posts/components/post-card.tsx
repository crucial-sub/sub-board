// 게시글 요약 정보를 타임라인 카드 형태로 보여주는 컴포넌트
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

	// 2분 이내 게시글은 NEW로 표시
	const isNew = (Date.now() - new Date(createdAt).getTime()) < 2 * 60 * 1000;

	return (
		<article
			className="timeline-card group relative"
			aria-labelledby={`post-title-${id}`}
		>
			{/* 타임라인 점 */}
			<div className="timeline-dot" />

			{/* NEW 배지 (5분 이내) */}
			{isNew && (
				<div className="absolute -top-2 -right-2 z-10">
					<div className="live-badge">
						<span className="live-pulse" />
						NEW
					</div>
				</div>
			)}

			{/* 상단: 작성자 정보 & 메타 */}
			<header className="flex items-start justify-between gap-4 mb-4">
				<div className="flex items-center gap-3">
					<span
						className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand/20 to-accent-cyan/20 text-sm font-bold text-brand border-2 border-white shadow-md"
						aria-hidden="true"
					>
						{authorInitial}
					</span>
					<div>
						<p className="text-sm font-bold text-text-primary">
							{author.nickname}
						</p>
						<time dateTime={createdAt} className="text-xs text-text-subtle flex items-center gap-1">
							<span>📅</span> {formattedCreatedAt}
						</time>
					</div>
				</div>

				{/* 조회수 */}
				<div className="flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-text-secondary shadow-sm border border-border-muted">
					<span aria-hidden="true">👁</span>
					<span className="sr-only">조회수</span>
					<span>{formatNumber(viewCount)}</span>
				</div>
			</header>

			{/* 제목 */}
			<Link
				href={`/posts/${id}`}
				id={`post-title-${id}`}
				className="block text-lg font-bold leading-snug text-text-primary transition hover:text-brand mb-4"
				aria-label={`${title} 게시글 보기`}
			>
				{title}
			</Link>

			{/* 하단: 태그 */}
			{tags?.length ? (
				<div className="flex flex-wrap items-center gap-2">
					{tags.map((tag) => (
						<Link
							key={tag.name}
							href={`/posts?tag=${encodeURIComponent(tag.name)}`}
							className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-brand/10 to-accent-cyan/10 border border-brand/20 px-2.5 py-1 text-xs font-semibold text-brand transition hover:from-brand/20 hover:to-accent-cyan/20 hover:border-brand/40"
							aria-label={`${tag.name} 태그로 검색`}
						>
							<span aria-hidden="true">#</span>
							{tag.name}
						</Link>
					))}
				</div>
			) : null}

			{/* 호버 시 하이라이트 효과 */}
			<div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-transparent transition duration-300 group-hover:border-brand/30 group-hover:shadow-[0_0_20px_rgba(10,132,255,0.15)]" />
		</article>
	);
}
