import type { Metadata } from "next";
import "@/styles/globals.css";
import { ReactQueryProvider } from "@/providers/react-query-provider";
import { UiProvider } from "@/providers/ui-provider";

export const metadata: Metadata = {
	title: "Sub Board",
	description: "게시판 프로젝트 프론트엔드",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="ko">
			<body className="bg-bg-app text-text-primary">
				<UiProvider>
					<ReactQueryProvider>{children}</ReactQueryProvider>
				</UiProvider>
			</body>
		</html>
	);
}
