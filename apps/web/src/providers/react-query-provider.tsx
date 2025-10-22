"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState } from "react";

const ReactQueryDevtools =
	process.env.NODE_ENV === "development"
		? dynamic(
				() =>
					import("@tanstack/react-query-devtools").then(
						(mod) => mod.ReactQueryDevtools,
					),
				{ ssr: false },
			)
		: () => null;

type Props = { children: React.ReactNode };

export function ReactQueryProvider({ children }: Props) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000, // 1분 - 기본 캐시 시간
						gcTime: 5 * 60 * 1000, // 5분 - 가비지 컬렉션 시간
						refetchOnWindowFocus: false, // 창 포커스 시 자동 리패치 비활성화
						retry: 1, // 실패 시 1번만 재시도
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
