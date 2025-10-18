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
