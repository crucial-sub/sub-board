import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { PostTagSummary } from "@/features/posts/types";

export function usePostsTagsQuery(options?: { initialData?: PostTagSummary[] }) {
	return useQuery({
		queryKey: ["posts", "tags"],
		queryFn: () => apiClient.get<PostTagSummary[]>("/posts/tags"),
		initialData: options?.initialData,
		staleTime: 1000 * 30,
	});
}
