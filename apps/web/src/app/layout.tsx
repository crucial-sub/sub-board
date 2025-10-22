import type { Metadata } from "next";
import "@/styles/globals.css";
import { getCurrentUserOnServer } from "@/features/auth/server/get-current-user";
import { ReactQueryProvider } from "@/providers/react-query-provider";
import { UiProvider } from "@/providers/ui-provider";

export const metadata: Metadata = {
	title: "Sub Board",
	description: "게시판 프로젝트 프론트엔드",
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const currentUser = await getCurrentUserOnServer();

	return (
		<html lang="ko">
			<head>
				<link
					rel="preload"
					href="/fonts/pretendard/PretendardVariable.woff2"
					as="font"
					type="font/woff2"
					crossOrigin="anonymous"
				/>
				<link
					rel="preload"
					href="/fonts/jetbrains-mono/JetBrainsMono-Regular.woff2"
					as="font"
					type="font/woff2"
					crossOrigin="anonymous"
				/>
			</head>
			<body className="text-text-primary">
				<UiProvider initialUser={currentUser}>
					<ReactQueryProvider>{children}</ReactQueryProvider>
				</UiProvider>
			</body>
		</html>
	);
}
