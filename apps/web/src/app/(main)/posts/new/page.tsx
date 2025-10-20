"use client";

// 새 게시글을 작성하는 페이지 컴포넌트
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useCreatePost } from "@/features/posts/hooks/usePostMutations";
import { useAuthGuard } from "@/features/auth/hooks/useAuthGuard";

export default function NewPostPage() {
	useAuthGuard();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [tagInput, setTagInput] = useState("");
	const [tags, setTags] = useState<string[]>([]);
	// 각 입력 필드는 useId로 생성된 고유 ID를 사용해 중복을 방지한다
	const titleInputId = useId();
	const contentInputId = useId();
	const tagInputId = useId();
	const mutation = useCreatePost();
	const router = useRouter();
	// 서버 응답 에러를 그대로 노출하거나 기본 문구로 대체한다
	const errorMessage = mutation.error?.message ?? "게시글 작성에 실패했습니다.";

	const handleAddTag = () => {
		const normalized = tagInput.replace(/^#/, "").trim();
		if (!normalized) return;
		if (tags.length >= 10) return;
		if (tags.some((tag) => tag.toLowerCase() === normalized.toLowerCase())) {
			setTagInput("");
			return;
		}
		setTags((prev) => [...prev, normalized]);
		setTagInput("");
	};

	const handleRemoveTag = (name: string) => {
		setTags((prev) => prev.filter((tag) => tag !== name));
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!title.trim() || !content.trim()) return;
		const result = await mutation.mutateAsync({
			title: title.trim(),
			content: content.trim(),
			tags,
		});
		setTitle("");
		setContent("");
		setTags([]);
		setTagInput("");
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

			<form onSubmit={handleSubmit} className="surface-card space-y-6 px-8 py-10">
				<div className="space-y-3">
					<label
						className="text-sm font-medium text-text-secondary"
						htmlFor={titleInputId}
					>
						제목
					</label>
					<input
						id={titleInputId}
						type="text"
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						className="w-full rounded-2xl border border-border-muted bg-white/80 px-4 py-3 text-sm text-text-primary shadow-card focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
						required
					/>
				</div>
				<div className="space-y-3">
					<label
						className="text-sm font-medium text-text-secondary"
						htmlFor={contentInputId}
					>
						내용
					</label>
					<textarea
						id={contentInputId}
						value={content}
						onChange={(event) => setContent(event.target.value)}
						className="min-h-[220px] w-full rounded-2xl border border-border-muted bg-white/80 px-4 py-3 text-sm text-text-primary shadow-card focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
						required
					/>
				</div>

				<div className="space-y-3">
					<label
						className="text-sm font-medium text-text-secondary"
						htmlFor={tagInputId}
					>
						태그
					</label>
					<div className="space-y-3">
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
							<input
								id={tagInputId}
								type="text"
								value={tagInput}
								onChange={(event) => setTagInput(event.target.value)}
								onKeyDown={(event) => {
									if (
										event.key === "Enter" &&
										!(event.nativeEvent as KeyboardEvent).isComposing
									) {
										event.preventDefault();
										handleAddTag();
									}
								}}
								placeholder="태그를 입력하고 Enter를 눌러 추가하세요 (최대 10개)"
								className="flex-1 rounded-2xl border border-border-muted bg-white/80 px-4 py-3 text-sm text-text-primary shadow-card focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
							/>
							<button
								type="button"
								onClick={handleAddTag}
								className="btn-outline flex w-full justify-center sm:w-auto"
							>
								추가
							</button>
						</div>
						{tags.length ? (
							<div className="flex flex-wrap gap-2">
								{tags.map((tag) => (
									<span key={tag} className="tag">
										#{tag}
										<button
											type="button"
											onClick={() => handleRemoveTag(tag)}
											className="text-text-secondary transition hover:text-red-400"
										>
											제거
										</button>
									</span>
								))}
							</div>
						) : (
							<p className="text-xs text-text-secondary">
								태그는 검색과 필터링에 사용됩니다. 예: 프론트엔드, 성능, Q&A
							</p>
						)}
					</div>
				</div>

				{mutation.error ? (
					<p className="text-sm text-red-400">{errorMessage}</p>
				) : null}

				<button
					type="submit"
					disabled={mutation.isPending}
					className="btn-gradient disabled:cursor-not-allowed disabled:opacity-60"
				>
					작성하기
				</button>
			</form>
		</section>
	);
}
