import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
	title: "Sub Board | 인증",
};

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="relative flex min-h-screen flex-col overflow-hidden">
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--accent-cyan)]/30 blur-[140px]" />
				<div className="absolute right-[-120px] bottom-10 h-72 w-72 rounded-full bg-[var(--accent-pink)]/25 blur-[120px]" />
			</div>
			<SiteHeader />
			<main className="flex flex-1 items-center justify-center px-4 pb-12">
				{children}
			</main>
		</div>
	);
}
