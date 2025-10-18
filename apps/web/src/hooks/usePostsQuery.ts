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

export function usePostsQuery({ page, pageSize, keyword }: { page: number; pageSize?: number; keyword?: string }) {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize ?? 10),
  });
  if (keyword) {
    query.set("keyword", keyword);
  }

  return useQuery({
    queryKey: ["posts", page, pageSize, keyword],
    queryFn: () => apiClient.get<PostListResponse>(`/posts?${query.toString()}`),
  });
}

export function usePostsInfiniteQuery({ pageSize = 10, keyword }: { pageSize?: number; keyword?: string }) {
  return useInfiniteQuery({
    queryKey: ["posts", "infinite", pageSize, keyword],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const query = new URLSearchParams({
        page: String(pageParam),
        pageSize: String(pageSize),
      });
      if (keyword) {
        query.set("keyword", keyword);
      }
      return apiClient.get<PostListResponse>(`/posts?${query.toString()}`);
    },
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage <= Math.ceil(lastPage.total / lastPage.pageSize) ? nextPage : undefined;
    },
  });
}
