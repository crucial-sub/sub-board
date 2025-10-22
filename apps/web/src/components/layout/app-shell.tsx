import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { NotificationToasterWrapper } from "./notification-toaster-wrapper";

export function AppShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="relative flex min-h-screen flex-col overflow-hidden">
			<a href="#main-content" className="skip-link">
				본문으로 건너뛰기
			</a>
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-brand/20 blur-[140px]" />
				<div className="absolute right-[-120px] top-1/3 h-80 w-80 rounded-full bg-[var(--accent-cyan)]/25 blur-[160px]" />
				<div className="absolute left-1/3 bottom-[-80px] h-72 w-72 rounded-full bg-white/60 blur-[180px]" />
			</div>
			<SiteHeader />
			<main id="main-content" className="container flex-1 py-12">
				{children}
			</main>
			<NotificationToasterWrapper />
			<SiteFooter />
		</div>
	);
}
