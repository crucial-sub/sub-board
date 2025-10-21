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
				className="text-sm text-text-secondary hover:text-text-primary"
			>
				← 목록으로 돌아가기
			</Link>
			<PostDetail id={id} initialData={initialPost} />
		</div>
	);
}
