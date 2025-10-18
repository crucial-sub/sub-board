import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComment, createPost, type CreateCommentPayload, type CreatePostPayload } from "../api";

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
