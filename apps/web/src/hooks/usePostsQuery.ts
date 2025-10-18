import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

type PostListResponse = {
  items: Array<{
    id: string;
    title: string;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
    author: {
      id: string;
      loginId: string;
      nickname: string;
    };
  }>;
  total: number;
  page: number;
  pageSize: number;
};

export function usePostsQuery(page: number, pageSize = 10) {
  return useQuery({
    queryKey: ["posts", page, pageSize],
    queryFn: () => apiClient.get<PostListResponse>(`/posts?page=${page}&pageSize=${pageSize}`),
  });
}

export function usePostsInfiniteQuery(pageSize = 10) {
  return useInfiniteQuery({
    queryKey: ["posts", "infinite", pageSize],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      return apiClient.get<PostListResponse>(`/posts?page=${pageParam}&pageSize=${pageSize}`);
    },
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage <= Math.ceil(lastPage.total / lastPage.pageSize) ? nextPage : undefined;
    },
  });
}
