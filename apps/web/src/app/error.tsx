"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Next.js App Router 에러 페이지
 * app 디렉토리 내 모든 에러를 포착
 */
export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// 에러 로깅
		console.error("App Error:", error);
	}, [error]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center px-6">
			<div className="surface-card max-w-md space-y-6 p-8 text-center">
				<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
					<span className="text-3xl" aria-hidden="true">
						⚠️
					</span>
				</div>
				<div className="space-y-2">
					<h1 className="text-2xl font-semibold text-text-primary">
						문제가 발생했습니다
					</h1>
					<p className="text-sm text-text-secondary">
						페이지를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
					</p>
				</div>
				{process.env.NODE_ENV === "development" && error.message && (
					<details className="rounded-2xl border border-red-200 bg-red-50/50 p-4 text-left">
						<summary className="cursor-pointer text-sm font-semibold text-red-700">
							개발 모드: 에러 상세 정보
						</summary>
						<pre className="mt-3 overflow-auto text-xs text-red-600">
							{error.message}
							{error.digest ? `\n\nDigest: ${error.digest}` : ""}
						</pre>
					</details>
				)}
				<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
					<button
						type="button"
						onClick={reset}
						className="btn-gradient"
						aria-label="페이지 다시 로드"
					>
						다시 시도
					</button>
					<Link href="/" className="btn-outline">
						홈으로 돌아가기
					</Link>
				</div>
			</div>
		</div>
	);
}
