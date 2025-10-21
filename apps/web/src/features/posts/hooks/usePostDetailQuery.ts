// 게시글 상세 데이터를 React Query로 조회하는 훅
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { PostDetailResponse } from "@/features/posts/types";

export function usePostDetailQuery(
	id: string,
	options?: { initialData?: PostDetailResponse },
) {
	return useQuery({
		queryKey: ["post", id],
		queryFn: () => apiClient.get<PostDetailResponse>(`/posts/${id}`),
		initialData: options?.initialData,
		staleTime: 1000 * 30,
	});
}
