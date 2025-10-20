"use client";

import Link from "next/link";
// 프런트 전역 상단 내비게이션 바를 렌더링한다
import { useLogoutMutation } from "@/features/auth/hooks/useAuthMutations";
import { useAuthStore } from "@/features/auth/state/auth-store";

const NAV_ITEMS = [
	{ href: "/" as const, label: "홈" },
	{ href: "/posts" as const, label: "게시판" },
	{ href: "/search" as const, label: "검색" },
	{ href: "/posts/new" as const, label: "글 작성" },
];

export function SiteHeader() {
	// Zustand 스토어가 초기 동기화되기 전에는 임시 스켈레톤을 노출한다
	const user = useAuthStore((state) => state.user);
	const hasHydrated = useAuthStore((state) => state.hasHydrated);
	const logoutMutation = useLogoutMutation();

	if (!hasHydrated) {
		// 초기 렌더에서는 사용자 정보를 아직 모름 → 간단한 로딩 상태로 대체한다
		return (
			<header className="border-b border-white/60 bg-white/70 backdrop-blur-2xl">
				<div className="container flex items-center justify-between py-4">
					<span className="h-5 w-24 animate-pulse rounded bg-white/60" />
					<span className="h-5 w-32 animate-pulse rounded bg-white/60" />
				</div>
			</header>
		);
	}

	return (
		<header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 shadow-card backdrop-blur-2xl">
			<div className="container flex items-center justify-between py-4">
				<Link
					href="/"
					className="text-base font-semibold tracking-tight text-text-primary transition hover:text-brand"
				>
					Sub Board
				</Link>
				<nav className="flex items-center gap-6 text-sm text-text-secondary">
					{NAV_ITEMS.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className="group relative pb-1.5 transition hover:text-brand"
						>
							<span className="absolute inset-x-0 -bottom-2 h-[2px] origin-left scale-x-0 bg-brand transition-transform duration-300 group-hover:scale-x-100" />
							{item.label}
						</Link>
					))}
					{user ? (
						<div className="flex items-center gap-3 text-text-primary">
							<span className="hidden text-sm font-medium text-text-secondary sm:inline">
								{user.nickname}님
							</span>
							<button
								type="button"
								onClick={() => logoutMutation.mutate()}
								disabled={logoutMutation.isPending}
								className="btn-outline disabled:cursor-not-allowed disabled:opacity-60"
							>
								로그아웃
							</button>
						</div>
					) : (
						<Link
							href="/login"
							className="btn-gradient"
						>
							로그인
						</Link>
					)}
				</nav>
			</div>
		</header>
	);
}
