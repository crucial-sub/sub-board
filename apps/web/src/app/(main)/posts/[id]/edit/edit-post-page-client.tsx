"use client";

// 게시글 수정을 위한 클라이언트 페이지 컴포넌트
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/features/auth/hooks/useAuthGuard";
import {
	PostEditorForm,
	type PostEditorFormValues,
} from "@/features/posts/components/post-editor-form";
import type { PostDetailResponse } from "@/features/posts/types";
import { useUpdatePost } from "@/features/posts/hooks/usePostMutations";

export function EditPostPageClient({
	postId,
	initialPost,
}: {
	postId: string;
	initialPost: PostDetailResponse;
}) {
	useAuthGuard();
	const router = useRouter();
	const mutation = useUpdatePost(postId);
	const errorMessage =
		mutation.error?.message ?? "게시글 수정에 실패했습니다.";

	const initialValues = useMemo(
		() => ({
			title: initialPost.title,
			content: initialPost.content,
			tags: initialPost.tags.map((tag) => tag.name),
		}),
		[initialPost],
	);

	const handleSubmit = async (values: PostEditorFormValues) => {
		await mutation.mutateAsync(values);
		router.push(`/posts/${postId}`);
	};

	return (
		<section className="space-y-8">
			<header className="surface-card space-y-3 px-8 py-10">
				<p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
					Update & refine
				</p>
				<h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">
					<span className="gradient-text">게시글 수정</span>
				</h1>
				<p className="text-text-secondary">
					내용을 다듬고 태그를 업데이트해 게시글을 최신 상태로 유지하세요.
				</p>
			</header>

			<PostEditorForm
				initialValues={initialValues}
				submitLabel="수정 완료"
				pending={mutation.isPending}
				errorMessage={mutation.error ? errorMessage : null}
				onSubmit={handleSubmit}
				onCancel={() => router.push(`/posts/${postId}`)}
			/>
		</section>
	);
}
