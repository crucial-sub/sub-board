"use client";

// 새 게시글을 작성하는 페이지 컴포넌트
import { useRouter } from "next/navigation";
import { useCreatePost } from "@/features/posts/hooks/usePostMutations";
import { useAuthGuard } from "@/features/auth/hooks/useAuthGuard";
import {
	PostEditorForm,
	type PostEditorFormValues,
} from "@/features/posts/components/post-editor-form";

export default function NewPostPage() {
	useAuthGuard();
	const mutation = useCreatePost();
	const router = useRouter();
	const errorMessage = mutation.error?.message ?? "게시글 작성에 실패했습니다.";

	const handleSubmit = async (values: PostEditorFormValues) => {
		const result = await mutation.mutateAsync(values);
		if (result?.id) {
			router.push(`/posts/${result.id}`);
		} else {
			router.push("/posts");
		}
	};

	return (
		<section className="space-y-8">
			<header className="surface-card space-y-3 px-8 py-10">
				<p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
					Write and share
				</p>
				<h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">
					<span className="gradient-text">새 글 작성</span>
				</h1>
				<p className="text-text-secondary">
					게시판에 공유하고 싶은 내용을 작성하세요.
				</p>
			</header>

			<PostEditorForm
				submitLabel="작성하기"
				pending={mutation.isPending}
				errorMessage={mutation.error ? errorMessage : null}
				onSubmit={handleSubmit}
			/>
		</section>
	);
}
