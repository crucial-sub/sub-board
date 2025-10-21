import "server-only";

import type {
	PostDetailResponse,
	PostListResponse,
	PostTagSummary,
} from "@/features/posts/types";
import { serverApiFetch } from "@/lib/server-api-client";

type FetchPostsOptions = {
	page: number;
	pageSize: number;
	tag?: string;
	keyword?: string;
};

// Reads the post list from the API and falls back to null when any error occurs.
export async function fetchPostsList(
	options: FetchPostsOptions,
): Promise<PostListResponse | null> {
	const query = new URLSearchParams({
		page: String(options.page),
		pageSize: String(options.pageSize),
	});

	if (options.tag) {
		query.set("tag", options.tag);
	}
	if (options.keyword) {
		query.set("keyword", options.keyword);
	}

	try {
		return await serverApiFetch<PostListResponse>(`/posts?${query.toString()}`);
	} catch (_error) {
		return null;
	}
}

export async function fetchPostDetail(
	id: string,
): Promise<PostDetailResponse | null> {
	try {
		return await serverApiFetch<PostDetailResponse>(`/posts/${id}`);
	} catch (_error) {
		return null;
	}
}

export async function fetchPostsTags(): Promise<PostTagSummary[]> {
	try {
		return await serverApiFetch<PostTagSummary[]>("/posts/tags");
	} catch (_error) {
		return [];
	}
}
