// 게시글 및 댓글 작성을 위한 API 래퍼 함수 모음
import { apiClient } from "@/lib/api-client";
import type {
	CommentMutationResponse,
	PostUpdateResponse,
} from "@/features/posts/types";

export type CreatePostPayload = {
	title: string;
	content: string;
	tags?: string[];
};

export type CreateCommentPayload = {
	postId: string;
	content: string;
};

export type UpdatePostPayload = {
	title?: string;
	content?: string;
	tags?: string[];
};

export type UpdateCommentPayload = {
	content: string;
};

export function createPost(payload: CreatePostPayload) {
	return apiClient.post<{ id: string }>({ path: "/posts", body: payload });
}

export function createComment(payload: CreateCommentPayload) {
	return apiClient.post<{ id: string }>({ path: "/comments", body: payload });
}

export function deleteComment(commentId: string) {
	return apiClient.delete<{ id: string }>(`/comments/${commentId}`);
}

export function updatePost(postId: string, payload: UpdatePostPayload) {
	return apiClient.patch<PostUpdateResponse>({
		path: `/posts/${postId}`,
		body: payload,
	});
}

export function updateComment(
	commentId: string,
	payload: UpdateCommentPayload,
) {
	return apiClient.patch<CommentMutationResponse>({
		path: `/comments/${commentId}`,
		body: payload,
	});
}
