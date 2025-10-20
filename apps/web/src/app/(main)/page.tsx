"use client";

import { useAuthStore } from "@/features/auth/state/auth-store";
import { fetchUserStats } from "@/features/users/api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function HomePage() {
	const user = useAuthStore((state) => state.user);
	const hasHydrated = useAuthStore((state) => state.hasHydrated);
	const { data: userStats, isLoading: isStatsLoading } = useQuery({
		queryKey: ["user-stats", user?.id],
		queryFn: fetchUserStats,
		enabled: Boolean(hasHydrated && user?.id),
		staleTime: 60_000,
	});

	if (hasHydrated && user) {
		return (
			<section className="space-y-12 py-10">
				<div className="relative overflow-hidden surface-card px-8 py-12">
					<div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[var(--accent-cyan)]/40 blur-[120px]" />
					<div className="pointer-events-none absolute -left-10 bottom-0 h-56 w-56 rounded-full bg-[var(--accent-pink)]/35 blur-[110px]" />
					<div className="space-y-6">
						<p className="text-xs font-semibold uppercase tracking-[0.45em] text-brand">
							Welcome Back
						</p>
						<h1 className="text-4xl font-semibold text-text-primary sm:text-5xl">
							<span className="gradient-text block">
								{user.nickname}님과 함께하는 오늘의 Sub Board
							</span>
						</h1>
						<p className="max-w-2xl text-lg text-text-secondary">
							맞춤 태그로 큐레이션된 최신 게시글을 살펴보고, 영감이 떠오를 때
							바로 새 글을 발행해 보세요.
						</p>
						<div className="flex flex-wrap gap-3">
							<Link href="/posts" className="btn-gradient">
								최신 게시글 탐색
							</Link>
							<Link href="/posts/new" className="btn-outline">
								아이디어 작성하기
							</Link>
						</div>
					</div>
					<div className="mt-10 grid gap-4 text-text-primary sm:grid-cols-3">
						<div className="surface-glass p-5">
							<p className="text-xs uppercase tracking-wide text-text-subtle">
								내 활동
							</p>
							<p className="mt-2 text-2xl font-semibold text-text-primary">
								{isStatsLoading ? (
									<span className="inline-block h-6 w-16 animate-pulse rounded bg-border-muted" />
								) : (
									`${userStats?.postCount ?? 0}건 작성`
								)}
							</p>
							<p className="text-xs text-text-secondary">
								{isStatsLoading ? (
									<span className="inline-block h-4 w-40 animate-pulse rounded bg-border-muted" />
								) : userStats?.lastPost ? (
									<>
										{new Date(
											userStats.lastPost.createdAt,
										).toLocaleDateString()}{" "}
										· {userStats.lastPost.title}
									</>
								) : (
									"아직 작성한 글이 없어요."
								)}
							</p>
						</div>
						<div className="surface-glass p-5">
							<p className="text-xs uppercase tracking-wide text-text-subtle">
								남긴 댓글
							</p>
							<p className="mt-2 text-2xl font-semibold text-text-primary">
								{isStatsLoading ? (
									<span className="inline-block h-6 w-16 animate-pulse rounded bg-border-muted" />
								) : (
									`${userStats?.commentCount ?? 0}건 참여`
								)}
							</p>
							<p className="text-xs text-text-secondary">
								{isStatsLoading ? (
									<span className="inline-block h-4 w-32 animate-pulse rounded bg-border-muted" />
								) : (
									"토론에 남긴 발자취를 확인해 보세요."
								)}
							</p>
						</div>
						<div className="surface-glass p-5">
							<p className="text-xs uppercase tracking-wide text-text-subtle">
								자주 사용하는 태그
							</p>
							<div className="mt-2 min-h-[48px]">
								{isStatsLoading ? (
									<div className="flex gap-2">
										<span className="h-6 w-16 animate-pulse rounded-full bg-border-muted" />
										<span className="h-6 w-16 animate-pulse rounded-full bg-border-muted" />
									</div>
								) : userStats?.topTags?.length ? (
									<div className="flex flex-wrap gap-2">
										{userStats.topTags.map((tag) => (
											<span key={tag.name} className="tag">
												#{tag.name} · {tag.count}
											</span>
										))}
									</div>
								) : (
									<p className="text-xs text-text-secondary">
										자주 사용하는 태그가 아직 없어요.
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="space-y-12 py-10">
			<div className="relative overflow-hidden surface-card px-8 py-14">
				<div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 transform bg-[var(--accent-cyan)]/40 blur-[120px]" />
				<div className="space-y-6 text-center sm:text-left">
					<p className="text-xs font-semibold uppercase tracking-[0.5em] text-brand">
						Next-gen Community Board
					</p>
					<h1 className="text-4xl font-semibold text-text-primary sm:text-5xl">
						<span className="gradient-text block">
							배움을 기록하고 공유하는 서브 보드
						</span>
					</h1>
					<p className="mx-auto max-w-2xl text-lg text-text-secondary sm:ml-0">
						Next.js, React Query, Tailwind CSS로 완성한 커뮤니티 공간입니다.
						아이디어를 자유롭게 나누고, 관심 있는 주제를 직접 큐레이션해 보세요.
					</p>
					<div className="flex flex-wrap justify-center gap-3 sm:justify-start">
						<Link href="/posts" className="btn-gradient">
							게시글 둘러보기
						</Link>
						{hasHydrated ? (
							<Link href="/login" className="btn-outline">
								탐험을 시작할게요
							</Link>
						) : (
							<span
								className="btn-outline invisible pointer-events-none select-none"
								aria-hidden="true"
							>
								탐험을 시작할게요
							</span>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
