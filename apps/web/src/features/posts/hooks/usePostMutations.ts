// 게시글과 댓글 작성/수정 뮤테이션을 제공하는 훅
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createComment,
	createPost,
	deleteComment,
	deletePost,
	updateComment,
	updatePost,
	type UpdateCommentPayload,
	type UpdatePostPayload,
} from "../api";

export function useCreatePost() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createPost,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["posts"] });
			void queryClient.invalidateQueries({ queryKey: ["posts", "tags"] });
		},
	});
}

export function useCreateComment(postId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createComment,
		// 낙관적 업데이트: 서버 응답 전에 UI를 즉시 업데이트
		onMutate: async (newComment) => {
			// 진행 중인 refetch를 취소하여 낙관적 업데이트가 덮어씌워지지 않도록 함
			await queryClient.cancelQueries({ queryKey: ["post", postId] });

			// 이전 데이터를 스냅샷으로 저장 (롤백용)
			const previousData = queryClient.getQueryData(["post", postId]);

			// 낙관적 업데이트 적용
			queryClient.setQueryData(["post", postId], (old: any) => {
				if (!old) return old;

				// 임시 댓글 객체 생성
				const optimisticComment = {
					id: `temp-${Date.now()}`,
					content: newComment.content,
					createdAt: new Date().toISOString(),
					author: {
						id: "current-user",
						nickname: "나", // 실제 닉네임은 서버 응답 후 갱신
					},
				};

				return {
					...old,
					comments: [...old.comments, optimisticComment],
				};
			});

			// 롤백을 위한 컨텍스트 반환
			return { previousData };
		},
		onError: (_error, _variables, context) => {
			// 에러 발생 시 이전 데이터로 롤백
			if (context?.previousData) {
				queryClient.setQueryData(["post", postId], context.previousData);
			}
		},
		onSuccess: () => {
			// 서버 데이터로 최종 갱신
			void queryClient.invalidateQueries({ queryKey: ["post", postId] });
		},
	});
}

// 댓글 삭제 후 상세 페이지 데이터를 최신화한다
export function useDeleteComment(postId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteComment,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["post", postId] });
		},
	});
}

export function useUpdatePost(postId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: UpdatePostPayload) => updatePost(postId, payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["post", postId] });
			void queryClient.invalidateQueries({ queryKey: ["posts"] });
			void queryClient.invalidateQueries({ queryKey: ["posts", "tags"] });
		},
	});
}

export function useUpdateComment(postId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			commentId,
			...payload
		}: UpdateCommentPayload & { commentId: string }) =>
			updateComment(commentId, payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["post", postId] });
		},
	});
}

export function useDeletePost() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deletePost,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["posts"] });
			void queryClient.invalidateQueries({ queryKey: ["posts", "tags"] });
		},
	});
}
