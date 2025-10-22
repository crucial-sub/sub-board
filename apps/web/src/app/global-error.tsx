"use client";

import Link from "next/link";

/**
 * Next.js Global Error Handler
 * 루트 레이아웃에서 발생하는 에러를 포착
 * html/body 태그를 포함해야 함
 */
export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html lang="ko">
			<body>
				<div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-6">
					<div className="w-full max-w-md space-y-6 rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-2xl">
						<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
							<span className="text-4xl" aria-hidden="true">
								🚨
							</span>
						</div>
						<div className="space-y-2">
							<h1 className="text-2xl font-bold text-gray-900">
								심각한 오류가 발생했습니다
							</h1>
							<p className="text-sm text-gray-600">
								애플리케이션을 불러올 수 없습니다. 페이지를 새로고침하거나 잠시 후
								다시 시도해 주세요.
							</p>
						</div>
						{process.env.NODE_ENV === "development" && error.message && (
							<details className="rounded-2xl border border-red-200 bg-red-50 p-4 text-left">
								<summary className="cursor-pointer text-sm font-semibold text-red-800">
									개발 모드: 에러 상세 정보
								</summary>
								<pre className="mt-3 overflow-auto text-xs text-red-700">
									{error.message}
									{error.digest ? `\n\nDigest: ${error.digest}` : ""}
								</pre>
							</details>
						)}
						<div className="flex flex-col gap-3">
							<button
								type="button"
								onClick={reset}
								className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
								aria-label="애플리케이션 다시 로드"
							>
								다시 시도
							</button>
							<Link
								href="/"
								className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
							>
								홈으로 돌아가기
							</Link>
						</div>
					</div>
				</div>
			</body>
		</html>
	);
}
