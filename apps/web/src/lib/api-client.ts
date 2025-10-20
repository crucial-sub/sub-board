"use client";

// 공통 fetch 로직을 담당하며 인증 쿠키 처리와 에러 정리를 담당한다
import { getAuthStoreClient } from "@/features/auth/state/auth-store";

// API 실패 시 상태 코드와 응답 본문을 묶어서 전달하는 에러 클래스
export class ApiError<T = unknown> extends Error {
	constructor(
		public status: number,
		message: string,
		public body?: T,
	) {
		super(message);
		this.name = "ApiError";
	}
}

export class ApiClient {
	constructor(private readonly baseUrl: string) {}

	async get<T>(path: string, init?: RequestInit): Promise<T> {
		return this.request<T>(path, { method: "GET", ...init });
	}

	async post<T>({
		path,
		body,
		init,
	}: {
		path: string;
		body: unknown;
		init?: RequestInit;
	}) {
		return this.request<T>(path, {
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
			},
			...init,
		});
	}

	// DELETE 요청도 공통 request 로직을 그대로 활용할 수 있도록 래핑한다
	async delete<T>(path: string, init?: RequestInit): Promise<T> {
		return this.request<T>(path, { method: "DELETE", ...init });
	}

	private async request<T>(path: string, init: RequestInit): Promise<T> {
		const response = await fetch(`${this.baseUrl}${path}`, {
			credentials: "include",
			...init,
		});

		const isJson = response.headers
			.get("content-type")
			?.includes("application/json");
		let data: unknown = null;

		if (response.status !== 204 && isJson) {
			try {
				data = await response.json();
			} catch (_error) {
				// json 파싱 오류는 data를 비워 둔다
				data = null;
			}
		}

		if (!response.ok) {
			if (response.status === 401) {
				// 인증 만료 응답이 오면 클라이언트 세션을 초기화해 UI를 동기화한다
				const { clearAuth, markHydrated } = getAuthStoreClient().getState();
				clearAuth();
				markHydrated();
			}

			let message = `API 요청 실패: ${response.status}`;
			if (typeof data === "object" && data !== null && "message" in data) {
				const rawMessage = (data as Record<string, unknown>).message;
				if (typeof rawMessage === "string") {
					message = rawMessage;
				} else if (Array.isArray(rawMessage)) {
					message = rawMessage.join("\n");
				}
			}
			throw new ApiError(response.status, message, data);
		}

		return data as T;
	}
}

export const apiClient = new ApiClient(
	process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001",
);
