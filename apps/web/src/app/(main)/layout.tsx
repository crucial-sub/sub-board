import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";

export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AppShell>
			<Suspense
				fallback={
					<div className="py-10 text-center text-text-secondary">
						로딩 중...
					</div>
				}
			>
				{children}
			</Suspense>
		</AppShell>
	);
}
