import "server-only";

import { cookies } from "next/headers";

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

// Fetch helper for server components to call the NestJS API with session cookies.
export async function serverApiFetch<T>(
	path: string,
	init?: RequestInit,
): Promise<T> {
	const cookieStore = await cookies();
	const cookieHeader = cookieStore.toString();
	const headers = new Headers(init?.headers ?? {});
	if (cookieHeader) {
		headers.set("cookie", cookieHeader);
	}

	const response = await fetch(`${API_BASE_URL}${path}`, {
		credentials: "include",
		cache: "no-store",
		...init,
		headers,
	});

	if (!response.ok) {
		throw new Error(`API 요청 실패: ${response.status}`);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	const contentType = response.headers.get("content-type");
	if (!contentType?.includes("application/json")) {
		return undefined as T;
	}

	return (await response.json()) as T;
}
