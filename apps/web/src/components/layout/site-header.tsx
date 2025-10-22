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
		<header className="sticky top-0 z-30 border-b border-white/40 bg-white/65 backdrop-blur-2xl">
			<div className="relative">
				<div className="pointer-events-none absolute inset-0 rounded-b-[32px] bg-gradient-to-r from-white/0 via-white/40 to-white/0" />
				<div className="container relative flex items-center justify-between py-5">
					<Link
						href="/"
						className="group flex items-center gap-2 text-lg font-semibold tracking-tight text-text-primary transition hover:text-brand"
					>
						<span className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 shadow-card transition group-hover:scale-105">
							<span className="gradient-text text-lg">SB</span>
						</span>
						<span className="hidden sm:inline">Sub Board</span>
					</Link>
					<nav className="flex h-10 items-center gap-4 text-sm text-text-secondary leading-none">
						{NAV_ITEMS.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="group relative inline-flex h-full items-center rounded-full px-3 py-1.5 transition hover:text-brand"
							>
								<span className="pointer-events-none absolute inset-0 rounded-full bg-white/0 transition duration-300 group-hover:bg-white/70 group-hover:shadow-[0_12px_25px_-18px_rgba(15,23,42,0.4)]" />
								<span className="absolute inset-x-4 bottom-0 h-[2px] origin-left scale-x-0 rounded-full bg-gradient-to-r from-brand via-accent-cyan to-accent-pink transition-transform duration-300 group-hover:scale-x-100" />
								<span className="relative z-10">{item.label}</span>
							</Link>
						))}
						{user ? (
							<div className="flex h-10 items-center gap-3 rounded-full border border-white/60 bg-white/70 px-3 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.35)]">
								<span className="hidden text-sm font-medium text-text-secondary sm:inline">
									{user.nickname}님
								</span>
								<Link
									href="/profile"
									className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-text-secondary transition hover:bg-brand/10 hover:text-brand"
								>
									프로필
								</Link>
								<LogoutButton />
							</div>
						) : (
							<Link href="/login" className="btn-gradient">
								로그인
							</Link>
						)}
					</nav>
				</div>
			</div>
		</header>
	);
}
