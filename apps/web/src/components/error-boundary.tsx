"use client";

import { Component, type ReactNode } from "react";
import Link from "next/link";

interface Props {
	children: ReactNode;
	fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

/**
 * React Error Boundary
 * 예상치 못한 에러를 포착하여 앱 전체가 중단되지 않도록 보호
 */
export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// 에러 로깅 (향후 Sentry 등으로 전송 가능)
		console.error("Error Boundary caught an error:", error, errorInfo);
	}

	reset = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError && this.state.error) {
			if (this.props.fallback) {
				return this.props.fallback(this.state.error, this.reset);
			}

			return <DefaultErrorFallback error={this.state.error} reset={this.reset} />;
		}

		return this.props.children;
	}
}

/**
 * 기본 에러 폴백 UI
 */
function DefaultErrorFallback({
	error,
	reset,
}: {
	error: Error;
	reset: () => void;
}) {
	return (
		<div className="flex min-h-[400px] flex-col items-center justify-center px-6">
			<div className="surface-card max-w-md space-y-6 p-8 text-center">
				<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
					<span className="text-3xl" aria-hidden="true">
						⚠️
					</span>
				</div>
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold text-text-primary">
						문제가 발생했습니다
					</h2>
					<p className="text-sm text-text-secondary">
						예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
					</p>
				</div>
				{process.env.NODE_ENV === "development" && (
					<details className="rounded-2xl border border-red-200 bg-red-50/50 p-4 text-left">
						<summary className="cursor-pointer text-sm font-semibold text-red-700">
							개발 모드: 에러 상세 정보
						</summary>
						<pre className="mt-3 overflow-auto text-xs text-red-600">
							{error.message}
							{"\n\n"}
							{error.stack}
						</pre>
					</details>
				)}
				<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
					<button type="button" onClick={reset} className="btn-gradient">
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
