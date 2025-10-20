"use client";

import Link from "next/link";
import { useAuthStore } from "@/features/auth/state/auth-store";

export default function HomePage() {
	const user = useAuthStore((state) => state.user);
	const hasHydrated = useAuthStore((state) => state.hasHydrated);

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
							<span className="gradient-text block">{user.nickname}님과 함께하는 오늘의 Sub Board</span>
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
								진행 중인 토론 3건
							</p>
							<p className="text-xs text-text-secondary">
								관심 있는 글에서 논의를 이어가 보세요.
							</p>
						</div>
						<div className="surface-glass p-5">
							<p className="text-xs uppercase tracking-wide text-text-subtle">
								즐겨찾는 태그
							</p>
							<p className="mt-2 text-2xl font-semibold text-text-primary">
								#스터디 #기술트렌드
							</p>
							<p className="text-xs text-text-secondary">
								맞춤 태그를 기반으로 추천을 강화했어요.
							</p>
						</div>
						<div className="surface-glass p-5">
							<p className="text-xs uppercase tracking-wide text-text-subtle">
								오늘의 제안
							</p>
							<p className="mt-2 text-2xl font-semibold text-text-primary">
								커뮤니티 뉴스레터 구독
							</p>
							<p className="text-xs text-text-secondary">
								한 주의 인기 글과 인사이트를 모아 드립니다.
							</p>
						</div>
					</div>
				</div>
				<CalloutPanels />
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
						아이디어를 자유롭게 나누고, 관심 있는 주제를 직접 큐레이션해
						보세요.
					</p>
					<div className="flex flex-wrap justify-center gap-3 sm:justify-start">
						<Link href="/posts" className="btn-gradient">
							게시글 둘러보기
						</Link>
						{hasHydrated ? (
							<Link href="/login" className="btn-outline">
								탐험을 시작할게요
							</Link>
						) : null}
					</div>
				</div>
			</div>
			<CalloutPanels />
		</section>
	);
}

function CalloutPanels() {
	return (
		<section className="grid gap-6 lg:grid-cols-3">
			<div className="surface-glass p-6">
				<p className="text-sm font-semibold text-text-primary">
					실시간 태그 피드
				</p>
				<p className="mt-2 text-sm text-text-secondary">
					인기 태그를 구독하고 원하는 주제만 빠르게 확인하세요.
				</p>
				<div className="mt-6 flex flex-wrap gap-2 text-xs text-text-secondary">
					<span className="tag">#라이브코딩</span>
					<span className="tag">#스터디모집</span>
					<span className="tag">#주간회고</span>
				</div>
			</div>
			<div className="surface-glass p-6">
				<p className="text-sm font-semibold text-text-primary">
					스토리 하이라이트
				</p>
				<p className="mt-2 text-sm text-text-secondary">
					커뮤니티에서 가장 사랑받은 게시글과 아카이브를 모아 드립니다.
				</p>
				<ul className="mt-5 space-y-3 text-xs text-text-secondary">
					<li>・ 2025년 프론트엔드 로드맵 아카이브</li>
					<li>・ 리모트 스터디를 운영하는 법</li>
					<li>・ 개발자 감성의 뉴스레터 템플릿</li>
				</ul>
			</div>
			<div className="surface-glass p-6">
				<p className="text-sm font-semibold text-text-primary">
					참여형 챌린지
				</p>
				<p className="mt-2 text-sm text-text-secondary">
					매주 열리는 커뮤니티 챌린지에 참여하고 배지를 모아 보세요.
				</p>
				<div className="mt-6 flex items-center gap-3 text-sm text-text-secondary">
					<span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand/20 text-lg font-bold text-brand">
						07
					</span>
					<p className="text-xs text-text-secondary">
						이번 주 미션: 당신이 사랑한 레거시 코드를 소개하기
					</p>
				</div>
			</div>
		</section>
	);
}
