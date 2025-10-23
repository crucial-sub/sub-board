import Link from "next/link";
import { notFound } from "next/navigation";
import { PostDetail } from "@/features/posts/components/post-detail";
import { fetchPostDetail } from "@/features/posts/server/queries";

type Params = {
	id: string;
};

type Props = {
	params: Promise<Params>;
};

export default async function PostDetailPage({ params }: Props) {
	const { id } = await params;
	const initialPost = await fetchPostDetail(id);

	if (!initialPost) {
		notFound();
	}

	return (
		<div className="space-y-6">
			<Link
				href="/posts"
				className="group inline-flex items-center gap-2 rounded-full border border-border-muted bg-white/70 px-4 py-2 text-sm font-semibold text-text-secondary shadow-sm transition hover:border-brand hover:bg-brand/5 hover:text-brand hover:shadow-md"
			>
				<span className="text-lg transition group-hover:-translate-x-1">←</span>
				<span>목록으로 돌아가기</span>
			</Link>
			<PostDetail id={id} initialData={initialPost} />
		</div>
	);
}
