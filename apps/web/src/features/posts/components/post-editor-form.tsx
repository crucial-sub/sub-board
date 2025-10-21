"use client";

// 게시글 작성/수정을 위한 공통 폼 컴포넌트
import { type FormEvent, useEffect, useId, useState } from "react";

export type PostEditorFormValues = {
	title: string;
	content: string;
	tags: string[];
};

export type PostEditorFormProps = {
	initialValues?: Partial<PostEditorFormValues>;
	submitLabel: string;
	pending: boolean;
	errorMessage?: string | null;
	onSubmit: (values: PostEditorFormValues) => Promise<void> | void;
	onCancel?: () => void;
};

export function PostEditorForm({
	initialValues,
	submitLabel,
	pending,
	errorMessage,
	onSubmit,
	onCancel,
}: PostEditorFormProps) {
	const [title, setTitle] = useState(initialValues?.title ?? "");
	const [content, setContent] = useState(initialValues?.content ?? "");
	const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);
	const [tagInput, setTagInput] = useState("");

	const titleInputId = useId();
	const contentInputId = useId();
	const tagInputId = useId();

	useEffect(() => {
		if (initialValues) {
			setTitle(initialValues.title ?? "");
			setContent(initialValues.content ?? "");
			setTags(initialValues.tags ?? []);
		}
	}, [initialValues]);

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

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const trimmedTitle = title.trim();
		const trimmedContent = content.trim();
		if (!trimmedTitle || !trimmedContent) return;

		await onSubmit({
			title: trimmedTitle,
			content: trimmedContent,
			tags,
		});
	};

	return (
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

			{errorMessage ? (
				<p className="text-sm text-red-400">{errorMessage}</p>
			) : null}

			<div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
				{onCancel ? (
					<button
						type="button"
						onClick={onCancel}
						className="btn-outline w-full sm:w-auto"
						disabled={pending}
					>
						취소
					</button>
				) : null}
				<button
					type="submit"
					disabled={pending}
					className="btn-gradient w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
				>
					{pending ? "처리 중..." : submitLabel}
				</button>
			</div>
		</form>
	);
}
