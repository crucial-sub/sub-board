import { apiClient } from "@/lib/api-client";

export type CreatePostPayload = {
  title: string;
  content: string;
};

export type CreateCommentPayload = {
  postId: string;
  content: string;
};

export function createPost(payload: CreatePostPayload) {
  return apiClient.post<{ id: string }>({ path: "/posts", body: payload });
}

export function createComment(payload: CreateCommentPayload) {
  return apiClient.post<{ id: string }>({ path: `/posts/${payload.postId}/comments`, body: payload });
}
