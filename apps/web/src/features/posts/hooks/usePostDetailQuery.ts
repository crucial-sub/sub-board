// 게시글 상세 데이터를 React Query로 조회하는 훅
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

type PostDetailResponse = {
  id: string;
  title: string;
  content: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    loginId: string;
    nickname: string;
  };
  tags: Array<{
    name: string;
  }>;
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      nickname: string;
    };
  }>;
};

export function usePostDetailQuery(id: string) {
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => apiClient.get<PostDetailResponse>(`/posts/${id}`),
  });
}
