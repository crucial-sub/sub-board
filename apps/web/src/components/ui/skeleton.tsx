import { cn } from "@/lib/utils";

/**
 * 로딩 스켈레톤 컴포넌트
 * 다양한 크기와 형태의 스켈레톤을 제공하여 일관된 로딩 UX 구현
 */
export function Skeleton({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"animate-pulse rounded-2xl bg-gradient-to-r from-border-muted via-white/50 to-border-muted bg-[length:200%_100%]",
				className,
			)}
			{...props}
		/>
	);
}

/**
 * 게시글 카드 스켈레톤
 */
export function PostCardSkeleton() {
	return (
		<article className="surface-card space-y-4 p-6">
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-center gap-3">
					<Skeleton className="h-10 w-10 shrink-0 rounded-2xl" />
					<div className="space-y-2">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-3 w-24" />
					</div>
				</div>
				<Skeleton className="h-6 w-16 rounded-full" />
			</div>
			<Skeleton className="h-6 w-3/4" />
			<div className="flex flex-wrap gap-2">
				<Skeleton className="h-7 w-16 rounded-full" />
				<Skeleton className="h-7 w-20 rounded-full" />
				<Skeleton className="h-7 w-14 rounded-full" />
			</div>
		</article>
	);
}

/**
 * 댓글 스켈레톤
 */
export function CommentSkeleton() {
	return (
		<li className="surface-card p-6">
			<div className="flex items-start gap-4">
				<Skeleton className="h-10 w-10 shrink-0 rounded-2xl" />
				<div className="flex-1 space-y-3">
					<div className="flex items-center justify-between">
						<div className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-3 w-32" />
						</div>
					</div>
					<Skeleton className="h-20 w-full rounded-2xl" />
				</div>
			</div>
		</li>
	);
}

/**
 * 통계 카드 스켈레톤
 */
export function StatCardSkeleton() {
	return (
		<div className="surface-glass space-y-2 p-6">
			<Skeleton className="h-4 w-20" />
			<Skeleton className="h-8 w-16" />
		</div>
	);
}

/**
 * 버튼 로딩 스피너
 */
export function ButtonSpinner({ className }: { className?: string }) {
	return (
		<svg
			className={cn("h-4 w-4 animate-spin", className)}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<circle
				className="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="4"
			/>
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	);
}
