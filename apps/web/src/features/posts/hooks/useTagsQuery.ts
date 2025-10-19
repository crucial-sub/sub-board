import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export type PostTagSummary = {
  id: string;
  name: string;
  count: number;
};

export function usePostsTagsQuery() {
  return useQuery({
    queryKey: ["posts", "tags"],
    queryFn: () => apiClient.get<PostTagSummary[]>("/posts/tags"),
  });
}
