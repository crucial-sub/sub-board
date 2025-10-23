import Link from "next/link";
import { getCurrentUserOnServer } from "@/features/auth/server/get-current-user";
import { LogoutButton } from "./logout-button";

const NAV_ITEMS = [
	{ href: "/" as const, label: "홈" },
	{ href: "/posts" as const, label: "게시판" },
	{ href: "/search" as const, label: "검색" },
	{ href: "/posts/new" as const, label: "글 작성" },
];

export async function SiteHeader() {
	const user = await getCurrentUserOnServer();

	return (
		<header className="sticky top-0 z-30 bg-gradient-to-b from-[var(--bg-app)] to-transparent pb-2">
			<div className="container">
				<div className="flex items-end justify-between gap-4 pt-4">
					{/* Logo */}
					<Link
						href="/"
						className="group mb-1 flex items-center gap-3 transition"
					>
						<span className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-accent-cyan shadow-[0_8px_16px_-8px_rgba(10,132,255,0.4)] transition group-hover:scale-105 group-hover:shadow-[0_12px_24px_-8px_rgba(10,132,255,0.5)]">
							<span className="text-xl font-extrabold text-white">SB</span>
						</span>
						<span className="hidden text-xl font-extrabold gradient-text sm:inline">Sub Board</span>
					</Link>

					{/* Bookmark Tab Navigation */}
					<nav className="flex items-end gap-1">
						{NAV_ITEMS.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="bookmark-tab group relative"
							>
								<span className="relative z-10">{item.label}</span>
							</Link>
						))}
						{user ? (
							<div className="bookmark-tab-user">
								<span className="hidden text-sm font-bold gradient-text sm:inline">
									{user.nickname}님
								</span>
								<Link
									href="/profile"
									className="rounded-lg bg-white/70 px-2.5 py-1 text-xs font-semibold text-text-secondary transition hover:bg-brand/10 hover:text-brand"
								>
									프로필
								</Link>
								<LogoutButton />
							</div>
						) : (
							<Link href="/login" className="bookmark-tab-cta">
								로그인
							</Link>
						)}
					</nav>
				</div>
			</div>
		</header>
	);
}
