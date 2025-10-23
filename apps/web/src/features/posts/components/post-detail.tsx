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
			<header className="surface-card relative overflow-hidden px-8 py-10 sm:px-12 sm:py-14">
				<div className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-[var(--accent-cyan)]/35 blur-[110px]" />
				<div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[var(--accent-pink)]/35 blur-[110px]" />
				<div className="space-y-6">
					{/* 메타 정보 */}
					<div className="flex flex-wrap items-center gap-2">
						<span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand/10 to-accent-cyan/10 border border-brand/20 px-3.5 py-1.5 text-xs font-bold text-brand shadow-sm">
							<span aria-hidden="true">👤</span>
							{data.author.nickname}
						</span>
						<span className="inline-flex items-center gap-2 rounded-full border border-border-muted bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-text-secondary shadow-sm">
							<span aria-hidden="true">📅</span>
							{formatKoreanDateTime(data.createdAt)}
						</span>
						<span className="inline-flex items-center gap-2 rounded-full border border-border-muted bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-text-secondary shadow-sm">
							<span aria-hidden="true">👁</span>
							{formatNumber(data.viewCount)}
						</span>
					</div>

					{/* 제목 */}
					<h1 className="text-3xl font-bold text-text-primary leading-tight sm:text-4xl lg:text-5xl">
						{data.title}
					</h1>

					{/* 태그 */}
					{data.tags.length ? (
						<div className="flex flex-wrap items-center gap-2">
							{data.tags.map((tag) => (
								<Link
									key={tag.name}
									href={`/posts?tag=${encodeURIComponent(tag.name)}`}
									className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-brand/10 to-accent-cyan/10 border border-brand/20 px-2.5 py-1 text-xs font-semibold text-brand transition hover:from-brand/20 hover:to-accent-cyan/20 hover:border-brand/40"
								>
									<span aria-hidden="true">#</span>
									{tag.name}
								</Link>
							))}
						</div>
					) : null}

					{/* 업데이트 시간 */}
					<p className="text-xs font-medium text-text-subtle">
						최종 업데이트: {formatKoreanDateTime(data.updatedAt)}
					</p>
				</div>

				{/* 수정 버튼 */}
				{hasHydrated && user?.id === data.author.id ? (
					<div className="mt-8 flex justify-end">
						<Link
							href={`/posts/${id}/edit`}
							className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-accent-cyan px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_16px_-8px_rgba(10,132,255,0.5)] transition hover:shadow-[0_12px_24px_-8px_rgba(10,132,255,0.6)] hover:scale-105"
						>
							<span>✏️</span>
							<span>게시글 수정</span>
						</Link>
					</div>
				) : null}
			</header>

			{/* 본문 */}
			<div className="surface-card px-8 py-10 sm:px-12 sm:py-14">
				<div className="prose prose-sm sm:prose-base max-w-none">
					<p className="whitespace-pre-wrap text-base leading-relaxed text-text-primary sm:text-lg">
						{data.content}
					</p>
				</div>
			</div>

			{/* 댓글 섹션 */}
			<section className="space-y-6">
				<div className="surface-card px-8 py-6">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-bold text-text-primary">
							💬 댓글 <span className="text-base font-semibold text-brand">({data.comments.length})</span>
						</h2>
						<button
							type="button"
							onClick={() => setShowCommentForm((prev) => !prev)}
							className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold shadow-md transition ${
								showCommentForm
									? "bg-white border border-border-muted text-text-secondary hover:bg-gray-50"
									: "bg-gradient-to-r from-brand to-accent-cyan text-white shadow-[0_8px_16px_-8px_rgba(10,132,255,0.5)] hover:shadow-[0_12px_24px_-8px_rgba(10,132,255,0.6)] hover:scale-105"
							}`}
							aria-label={showCommentForm ? "댓글 작성 취소" : "댓글 작성하기"}
							aria-expanded={showCommentForm}
							onKeyDown={(e) => {
								if (e.key === "Escape" && showCommentForm) {
									setShowCommentForm(false);
								}
							}}
						>
							<span>{showCommentForm ? "❌" : "✍️"}</span>
							<span>{showCommentForm ? "작성 취소" : "댓글 쓰기"}</span>
						</button>
					</div>
				</div>

				{showCommentForm ? (
					<div className="surface-card px-8 py-8">
						<CommentForm postId={id} onCancel={() => setShowCommentForm(false)} />
					</div>
				) : null}
				{deleteMutation.error ? (
					<div className="rounded-2xl border-2 border-red-300 bg-red-50 px-5 py-4 shadow-md">
						<p className="text-sm font-semibold text-red-600">
							⚠️ {deleteMutation.error instanceof Error
								? deleteMutation.error.message
								: "댓글 삭제에 실패했습니다."}
						</p>
					</div>
				) : null}

				{data.comments.length === 0 ? (
					<div className="surface-card px-8 py-12 text-center">
						<p className="text-base font-medium text-text-secondary">
							💭 아직 댓글이 없어요. 첫 댓글을 남겨보세요!
						</p>
					</div>
				) : (
					<ul className="space-y-5">
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
									className="surface-card relative overflow-hidden px-6 py-6 sm:px-8 sm:py-7"
								>
									<div className="relative flex items-start gap-4">
										{/* 프로필 아이콘 */}
										<span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand/20 to-accent-cyan/20 text-sm font-bold text-brand border-2 border-white shadow-md">
											{commentInitial}
										</span>

										<div className="flex-1 space-y-4">
											{/* 작성자 & 시간 & 액션 버튼 */}
											<div className="flex flex-wrap items-start justify-between gap-3">
												<div>
													<p className="text-base font-bold text-text-primary">
														{comment.author.nickname}
													</p>
													<time
														dateTime={comment.createdAt}
														className="text-xs font-medium text-text-subtle"
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
															className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand/10 to-accent-cyan/10 border border-brand/20 px-3 py-1.5 text-xs font-bold text-brand transition hover:from-brand/20 hover:to-accent-cyan/20 hover:border-brand/40 disabled:cursor-not-allowed disabled:opacity-60"
															aria-label={`${comment.author.nickname}님의 댓글 수정`}
														>
															✏️ 수정
														</button>
														<button
															type="button"
															onClick={() =>
																deleteMutation.mutateAsync(comment.id)
															}
															disabled={isDeleting || isUpdating}
															className="inline-flex items-center gap-1 rounded-full border-2 border-red-300 bg-white px-3 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-50 hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-60"
															aria-label={`${comment.author.nickname}님의 댓글 삭제`}
														>
															{isDeleting ? "🔄 삭제 중..." : "🗑️ 삭제"}
														</button>
													</div>
												) : null}
											</div>

											{/* 댓글 내용 / 수정 폼 */}
											{isEditing ? (
												<div className="space-y-4">
													<textarea
														value={editingContent}
														onChange={(event) =>
															setEditingContent(event.target.value)
														}
														className="w-full rounded-2xl border-2 border-border-muted bg-white px-4 py-3 text-sm text-text-primary shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 transition"
														rows={4}
														placeholder="댓글 내용을 입력하세요..."
													/>
													{updateMutation.error &&
													updateTargetCommentId === comment.id ? (
														<p className="text-xs font-semibold text-red-500">
															⚠️ {updateErrorMessage}
														</p>
													) : null}
													<div className="flex justify-end gap-2">
														<button
															type="button"
															onClick={resetEditingState}
															disabled={isUpdating}
															className="rounded-full border-2 border-border-muted bg-white px-5 py-2 text-sm font-bold text-text-secondary transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
														>
															취소
														</button>
														<button
															type="button"
															onClick={handleUpdateComment}
															disabled={isUpdating}
															className="rounded-full bg-gradient-to-r from-brand to-accent-cyan px-6 py-2 text-sm font-bold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
														>
															{isUpdating ? "💾 수정 중..." : "💾 저장"}
														</button>
													</div>
												</div>
											) : (
												<div className="rounded-2xl bg-gradient-to-br from-white/90 to-white/70 border border-border-muted px-5 py-4 shadow-sm">
													<p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary sm:text-base">
														{comment.content}
													</p>
												</div>
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
