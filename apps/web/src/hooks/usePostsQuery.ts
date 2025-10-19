// 게시글 목록을 페이지네이션/무한스크롤 형태로 조회하는 React Query 훅
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
    tags: Array<{
      name: string;
    }>;
  }>;
  total: number;
  page: number;
  pageSize: number;
};

export function usePostsQuery({ page, pageSize, keyword, tag }: { page: number; pageSize?: number; keyword?: string; tag?: string }) {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize ?? 10),
  });
  if (keyword) {
    query.set("keyword", keyword);
  }
  if (tag) {
    query.set("tag", tag);
  }

  return useQuery({
    queryKey: ["posts", page, pageSize, keyword, tag],
    queryFn: () => apiClient.get<PostListResponse>(`/posts?${query.toString()}`),
  });
}

export function usePostsInfiniteQuery({ pageSize = 10, keyword, tag }: { pageSize?: number; keyword?: string; tag?: string }) {
  return useInfiniteQuery({
    queryKey: ["posts", "infinite", pageSize, keyword, tag],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const query = new URLSearchParams({
        page: String(pageParam),
        pageSize: String(pageSize),
      });
      if (keyword) {
        query.set("keyword", keyword);
      }
      if (tag) {
        query.set("tag", tag);
      }
      return apiClient.get<PostListResponse>(`/posts?${query.toString()}`);
    },
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage <= Math.ceil(lastPage.total / lastPage.pageSize) ? nextPage : undefined;
    },
  });
}
