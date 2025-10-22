"use client";

// 댓글 작성을 위한 입력 폼과 제출 로직을 담당하는 컴포넌트
import { useState, useEffect, useRef } from "react";
import { useCreateComment } from "../hooks/usePostMutations";
import { useAuthStore } from "@/features/auth/state/auth-store";
import { ButtonSpinner } from "@/components/ui/skeleton";

export function CommentForm({
	postId,
	onCancel,
}: {
	postId: string;
	onCancel?: () => void;
}) {
	const [content, setContent] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const mutation = useCreateComment(postId);
	const user = useAuthStore((state) => state.user);
	const hasHydrated = useAuthStore((state) => state.hasHydrated);
	// 서버에서 내려온 구체적인 오류 문구를 사용자에게 보여준다
	const errorMessage = mutation.error?.message ?? "댓글 작성에 실패했습니다.";

	// 폼이 열릴 때 텍스트 영역에 자동 포커스
	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.focus();
		}
	}, []);

	if (!hasHydrated) {
		return null;
	}

	if (!user) {
		return (
			<p className="rounded-2xl border border-border-muted bg-white/70 px-4 py-3 text-sm text-text-secondary">
				로그인 후 댓글을 작성할 수 있습니다.
			</p>
		);
	}

	// Escape 키로 취소
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape" && onCancel) {
				event.preventDefault();
				onCancel();
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [onCancel]);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!content.trim()) return;
		await mutation.mutateAsync({ postId, content: content.trim() });
		setContent("");
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-3">
			<textarea
				ref={textareaRef}
				value={content}
				onChange={(event) => setContent(event.target.value)}
				placeholder="댓글을 입력하세요 (Escape 키로 취소)"
				className="w-full rounded-2xl border border-border-muted bg-white/80 px-4 py-3 text-sm text-text-primary shadow-card focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
				rows={3}
				aria-label="댓글 내용"
			/>
			<button
				type="submit"
				disabled={mutation.isPending}
				className="btn-gradient inline-flex items-center disabled:cursor-not-allowed disabled:opacity-60"
			>
				{mutation.isPending ? (
					<>
						<ButtonSpinner />
						<span className="ml-2">작성 중...</span>
					</>
				) : (
					"댓글 작성"
				)}
			</button>
			{mutation.error ? (
				<p className="text-sm text-red-500">{errorMessage}</p>
			) : null}
		</form>
	);
}
