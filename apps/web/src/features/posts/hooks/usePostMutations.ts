// 게시글과 댓글 작성 뮤테이션을 제공하는 훅
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComment, createPost } from "../api";

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
}
