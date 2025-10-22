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
			<div
				className="surface-glass p-6 text-sm text-text-secondary"
				role="status"
				aria-live="polite"
			>
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
			<header className="surface-card relative overflow-hidden px-10 py-12">
				<div className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-[var(--accent-cyan)]/35 blur-[110px]" />
				<div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[var(--accent-pink)]/35 blur-[110px]" />
				<div className="space-y-5">
					<div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
						<span className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 font-semibold text-text-secondary shadow-sm">
							<span aria-hidden="true">👤</span>
							{data.author.nickname}
						</span>
						<span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-3 py-1 font-semibold text-text-secondary">
							<span aria-hidden="true">📅</span>
							{formatKoreanDateTime(data.createdAt)}
						</span>
						<span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-3 py-1 font-semibold text-text-secondary">
							<span aria-hidden="true">👁</span>
							{formatNumber(data.viewCount)}회 열람
						</span>
					</div>
					<h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">
						<span className="gradient-text">{data.title}</span>
					</h1>
					<p className="text-xs text-text-subtle">
						최종 업데이트: {formatKoreanDateTime(data.updatedAt)}
					</p>
				</div>
				{hasHydrated && user?.id === data.author.id ? (
					<div className="mt-6 flex justify-end">
						<Link
							href={`/posts/${id}/edit`}
							className="inline-flex items-center justify-center rounded-full border border-brand/30 bg-white/80 px-4 py-2 text-sm font-semibold text-brand shadow-[0_16px_32px_-26px_rgba(10,132,255,0.65)] transition hover:border-brand hover:bg-brand/10"
						>
							게시글 수정
						</Link>
					</div>
				) : null}
			</header>

			<div className="surface-card whitespace-pre-wrap px-10 py-12 text-base leading-relaxed text-text-secondary">
				{data.content}
			</div>

			{data.tags.length ? (
				<div className="surface-glass flex flex-wrap items-center gap-3 px-7 py-5">
					<span className="text-xs font-semibold uppercase tracking-[0.25em] text-text-subtle">
						Tags
					</span>
					{data.tags.map((tag) => (
						<Link
							key={tag.name}
							href={`/posts?tag=${encodeURIComponent(tag.name)}`}
							className="tag transition hover:scale-105"
						>
							<span aria-hidden="true">#</span>
							{tag.name}
						</Link>
					))}
				</div>
			) : null}

			<section className="space-y-4">
				<div className="flex items-center justify-between rounded-[22px] border border-white/60 bg-white/70 px-5 py-3 shadow-sm">
					<h2 className="text-lg font-semibold text-text-primary">
						댓글 <span className="text-sm text-text-subtle">({data.comments.length})</span>
					</h2>
					<button
						type="button"
						onClick={() => setShowCommentForm((prev) => !prev)}
						className="btn-outline px-4 py-2 text-xs font-semibold tracking-wide"
						aria-label={showCommentForm ? "댓글 작성 취소" : "댓글 작성하기"}
						aria-expanded={showCommentForm}
						onKeyDown={(e) => {
							if (e.key === "Escape" && showCommentForm) {
								setShowCommentForm(false);
							}
						}}
					>
						{showCommentForm ? "작성 취소" : "댓글 쓰기"}
					</button>
				</div>
				{showCommentForm ? (
					<div className="surface-card p-6">
						<CommentForm postId={id} onCancel={() => setShowCommentForm(false)} />
					</div>
				) : null}
				{deleteMutation.error ? (
					<p className="rounded-[20px] border border-red-200/70 bg-red-50/80 px-4 py-3 text-sm text-red-500">
						{deleteMutation.error instanceof Error
							? deleteMutation.error.message
							: "댓글 삭제에 실패했습니다."}
					</p>
				) : null}
				{data.comments.length === 0 ? (
					<p className="rounded-2xl border border-border-muted bg-white/80 px-6 py-8 text-center text-sm text-text-secondary shadow-sm">
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
							const commentInitial = comment.author.nickname
								.slice(0, 1)
								.toUpperCase();

							return (
								<li
									key={comment.id}
									className="surface-card relative overflow-hidden p-6 text-sm shadow-sm"
								>
									<div className="relative flex items-start gap-4">
										<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-xs font-semibold text-brand shadow-[0_12px_22px_-20px_rgba(15,23,42,0.45)]">
											{commentInitial}
										</span>
										<div className="flex-1 space-y-3">
											<div className="flex flex-wrap items-center justify-between gap-3">
												<div>
													<p className="text-sm font-semibold text-text-primary">
														{comment.author.nickname}
													</p>
													<time
														dateTime={comment.createdAt}
														className="text-xs text-text-subtle"
													>
														{formatKoreanDateTime(comment.createdAt)}
													</time>
												</div>
												{isAuthor && !isEditing ? (
													<div className="flex items-center gap-2">
														<button
															type="button"
															onClick={() =>
																beginEditComment(
																	comment.id,
																	comment.content,
																)
															}
															disabled={isDeleting || isAnotherEditing}
															className="rounded-full border border-brand/20 bg-white/80 px-3 py-1 text-xs font-semibold text-brand transition hover:border-brand hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-60"
															aria-label={`${comment.author.nickname}님의 댓글 수정`}
														>
															수정
														</button>
														<button
															type="button"
															onClick={() =>
																deleteMutation.mutateAsync(comment.id)
															}
															disabled={isDeleting || isUpdating}
															className="rounded-full border border-red-200/70 bg-white/80 px-3 py-1 text-xs font-semibold text-red-400 transition hover:border-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
															aria-label={`${comment.author.nickname}님의 댓글 삭제`}
														>
															{isDeleting ? "삭제 중..." : "삭제"}
														</button>
													</div>
												) : null}
											</div>
											{isEditing ? (
												<div className="space-y-3">
													<textarea
														value={editingContent}
														onChange={(event) =>
															setEditingContent(event.target.value)
														}
														className="w-full rounded-2xl border border-border-muted bg-white/90 px-3 py-2 text-sm text-text-primary shadow-inner focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
														rows={3}
													/>
													{updateMutation.error &&
													updateTargetCommentId === comment.id ? (
														<p className="text-xs text-red-500">
															{updateErrorMessage}
														</p>
													) : null}
													<div className="flex justify-end gap-2">
														<button
															type="button"
															onClick={resetEditingState}
															disabled={isUpdating}
															className="btn-outline px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
														>
															취소
														</button>
														<button
															type="button"
															onClick={handleUpdateComment}
															disabled={isUpdating}
															className="btn-gradient px-5 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
														>
															{isUpdating ? "수정 중..." : "저장"}
														</button>
													</div>
												</div>
											) : (
												<p className="whitespace-pre-wrap rounded-2xl bg-white/70 px-4 py-3 text-sm text-text-secondary shadow-[0_18px_35px_-30px_rgba(15,23,42,0.55)]">
													{comment.content}
												</p>
											)}
										</div>
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</section>
		</article>
	);
}
