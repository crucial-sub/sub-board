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
		<header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 shadow-card backdrop-blur-2xl">
			<div className="container flex items-center justify-between py-4">
				<Link
					href="/"
					className="flex h-10 items-center text-base font-semibold tracking-tight text-text-primary transition hover:text-brand"
				>
					Sub Board
				</Link>
				<nav className="flex h-10 items-center gap-6 text-sm text-text-secondary leading-none">
					{NAV_ITEMS.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className="group relative inline-flex h-full items-center transition hover:text-brand"
						>
							<span className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-brand transition-transform duration-300 group-hover:scale-x-100" />
							{item.label}
						</Link>
					))}
					{user ? (
						<div className="flex h-10 items-center gap-3 text-text-primary">
							<span className="hidden text-sm font-medium text-text-secondary sm:inline">
								{user.nickname}님
							</span>
							<Link
								href="/profile"
								className="rounded-full border border-border-muted px-3 py-1 text-xs text-text-secondary transition hover:border-brand hover:text-brand"
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
		</header>
	);
}
