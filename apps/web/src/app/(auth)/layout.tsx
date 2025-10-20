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
		<div className="flex min-h-screen flex-col bg-bg-app">
			<SiteHeader />
			<main className="flex flex-1 items-center justify-center px-4 pb-12">
				{children}
			</main>
		</div>
	);
}
