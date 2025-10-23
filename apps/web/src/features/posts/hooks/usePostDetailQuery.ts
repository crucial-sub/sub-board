// 게시글 상세 데이터를 React Query로 조회하는 훅
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { PostDetailResponse } from "@/features/posts/types";

export function usePostDetailQuery(
	id: string,
	options?: { initialData?: PostDetailResponse; refetchInterval?: number },
) {
	return useQuery({
		queryKey: ["post", id],
		queryFn: () => apiClient.get<PostDetailResponse>(`/posts/${id}`),
		initialData: options?.initialData,
		staleTime: 5 * 60 * 1000, // 5분 - 게시글 내용은 자주 변경되지 않음
		refetchInterval: options?.refetchInterval, // 조회수 실시간 업데이트용
	});
}
