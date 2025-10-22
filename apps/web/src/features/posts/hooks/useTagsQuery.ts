import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { PostTagSummary } from "@/features/posts/types";

export function usePostsTagsQuery(options?: { initialData?: PostTagSummary[] }) {
	return useQuery({
		queryKey: ["posts", "tags"],
		queryFn: () => apiClient.get<PostTagSummary[]>("/posts/tags"),
		initialData: options?.initialData,
		staleTime: 10 * 60 * 1000, // 10분 - 태그 목록은 더 드물게 변경됨
	});
}
