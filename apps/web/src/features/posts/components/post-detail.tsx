"use client";

// 게시글 상세 정보와 댓글 목록/작성 폼을 함께 렌더링하는 컴포넌트
import { usePostDetailQuery } from "@/features/posts/hooks/usePostDetailQuery";
import type { PostDetailResponse } from "@/features/posts/types";
import Link from "next/link";
import { CommentForm } from "./comment-form";
import { useState } from "react";
import { useAuthStore } from "@/features/auth/state/auth-store";
import {
	useDeleteComment,
	useUpdateComment,
} from "@/features/posts/hooks/usePostMutations";
import { formatKoreanDateTime, formatNumber } from "@/lib/formatters";

export function PostDetail({
	id,
	initialData,
}: {
	id: string;
	initialData?: PostDetailResponse | null;
}) {
	const [showCommentForm, setShowCommentForm] = useState(false);
	const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
	const [editingContent, setEditingContent] = useState("");
	const { data, isLoading, isError } = usePostDetailQuery(id, {
		initialData: initialData ?? undefined,
	});
	const user = useAuthStore((state) => state.user);
	const hasHydrated = useAuthStore((state) => state.hasHydrated);
	// 댓글 삭제 후 상세 데이터를 무효화하는 뮤테이션
	const deleteMutation = useDeleteComment(id);
	const updateMutation = useUpdateComment(id);
	const pendingCommentId = deleteMutation.isPending
		? (deleteMutation.variables as string | undefined)
		: undefined;
	const updateTargetCommentId =
		(updateMutation.variables as { commentId: string } | undefined)?.commentId ??
		null;
	const updateErrorMessage =
		updateMutation.error?.message ?? "댓글 수정에 실패했습니다.";

	const beginEditComment = (commentId: string, content: string) => {
		setEditingCommentId(commentId);
		setEditingContent(content);
	};

	const resetEditingState = () => {
		setEditingCommentId(null);
		setEditingContent("");
	};

	const handleUpdateComment = async () => {
		if (!editingCommentId) return;
		const trimmed = editingContent.trim();
		if (!trimmed) return;
		try {
			await updateMutation.mutateAsync({
				commentId: editingCommentId,
				content: trimmed,
			});
			resetEditingState();
		} catch (_error) {
			// 에러는 updateMutation.error를 통해 노출한다
		}
	};

	if (isLoading) {
		return (
			<div className="surface-glass p-6 text-sm text-text-secondary">
				게시글을 불러오는 중입니다...
			</div>
		);
	}

	if (isError || !data) {
		return (
			<p className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
				게시글을 불러오는 데 실패했습니다.
			</p>
		);
	}

	return (
		<article className="space-y-8">
			<header className="surface-card space-y-4 px-8 py-10">
				<div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
					작성자 {data.author.nickname} · 조회수 {formatNumber(data.viewCount)}
				</div>
				<h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">
					<span className="gradient-text">{data.title}</span>
				</h1>
				<time className="text-xs text-text-secondary" dateTime={data.createdAt}>
					{formatKoreanDateTime(data.createdAt)}
				</time>
				{hasHydrated && user?.id === data.author.id ? (
					<div className="flex justify-end">
						<Link
							href={`/posts/${id}/edit`}
							className="btn-outline inline-flex items-center justify-center"
						>
							게시글 수정
						</Link>
					</div>
				) : null}
			</header>

			<div className="surface-card whitespace-pre-wrap px-8 py-10 text-sm leading-relaxed text-text-secondary">
				{data.content}
			</div>

			{data.tags.length ? (
				<div className="surface-glass flex flex-wrap gap-2 px-6 py-4">
					{data.tags.map((tag) => (
						<Link
							key={tag.name}
							href={`/posts?tag=${encodeURIComponent(tag.name)}`}
							className="tag transition hover:scale-105"
						>
							#{tag.name}
						</Link>
					))}
				</div>
			) : null}

			<section className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-text-primary">댓글</h2>
					<button
						type="button"
						onClick={() => setShowCommentForm((prev) => !prev)}
						className="text-sm text-brand transition hover:text-brand-hover"
					>
						{showCommentForm ? "작성 취소" : "댓글 쓰기"}
					</button>
				</div>
				{showCommentForm ? (
					<div className="surface-glass p-5">
						<CommentForm postId={id} />
					</div>
				) : null}
				{deleteMutation.error ? (
					<p className="text-sm text-red-400">
						{deleteMutation.error instanceof Error
							? deleteMutation.error.message
							: "댓글 삭제에 실패했습니다."}
					</p>
				) : null}
				{data.comments.length === 0 ? (
					<p className="rounded-2xl border border-border-muted bg-white/70 px-4 py-5 text-sm text-text-secondary">
						첫 댓글을 남겨보세요.
					</p>
				) : (
					<ul className="space-y-4">
						{data.comments.map((comment) => {
							const isAuthor =
								hasHydrated && user?.id === comment.author.id;
							const isEditing = editingCommentId === comment.id;
							const isDeleting = pendingCommentId === comment.id;
							const isUpdating =
								updateMutation.isPending &&
								updateTargetCommentId === comment.id;
							const isAnotherEditing =
								editingCommentId !== null && editingCommentId !== comment.id;

							return (
								<li
									key={comment.id}
									className="surface-glass space-y-3 p-5 text-sm"
								>
									<div className="flex items-center justify-between text-xs text-text-secondary">
										<span>{comment.author.nickname}</span>
										<div className="flex items-center gap-2">
											<time dateTime={comment.createdAt}>
												{formatKoreanDateTime(comment.createdAt)}
											</time>
											{isAuthor && !isEditing ? (
												<>
													<button
														type="button"
														onClick={() =>
															beginEditComment(comment.id, comment.content)
														}
														disabled={isDeleting || isAnotherEditing}
														className="rounded-full border border-border-muted px-2 py-1 text-xs text-text-secondary transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
													>
														수정
													</button>
													<button
														type="button"
														onClick={() =>
															deleteMutation.mutateAsync(comment.id)
														}
														disabled={isDeleting || isUpdating}
														className="rounded-full border border-border-muted px-2 py-1 text-xs text-text-secondary transition hover:border-red-300 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-60"
													>
														{isDeleting ? "삭제 중..." : "삭제"}
													</button>
												</>
											) : null}
										</div>
									</div>
									{isEditing ? (
										<div className="space-y-3">
											<textarea
												value={editingContent}
												onChange={(event) => setEditingContent(event.target.value)}
												className="w-full rounded-2xl border border-border-muted bg-white/80 px-3 py-2 text-sm text-text-primary shadow-card focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
												rows={3}
											/>
											{updateMutation.error &&
											updateTargetCommentId === comment.id ? (
												<p className="text-xs text-red-400">
													{updateErrorMessage}
												</p>
											) : null}
											<div className="flex justify-end gap-2">
												<button
													type="button"
													onClick={resetEditingState}
													disabled={isUpdating}
													className="btn-outline inline-flex items-center justify-center px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
												>
													취소
												</button>
												<button
													type="button"
													onClick={handleUpdateComment}
													disabled={isUpdating}
													className="btn-gradient inline-flex items-center justify-center px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
												>
													{isUpdating ? "수정 중..." : "저장"}
												</button>
											</div>
										</div>
									) : (
										<p className="whitespace-pre-wrap text-text-secondary">
											{comment.content}
										</p>
									)}
								</li>
							);
						})}
					</ul>
				)}
			</section>
		</article>
	);
}
