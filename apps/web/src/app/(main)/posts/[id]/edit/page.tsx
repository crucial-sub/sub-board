import { notFound, redirect } from "next/navigation";
import { fetchPostDetail } from "@/features/posts/server/queries";
import { getCurrentUserOnServer } from "@/features/auth/server/get-current-user";
import { EditPostPageClient } from "./edit-post-page-client";

type Params = {
	id: string;
};

type Props = {
	params: Promise<Params>;
};

export default async function EditPostPage({ params }: Props) {
	const { id } = await params;
	const [currentUser, initialPost] = await Promise.all([
		getCurrentUserOnServer(),
		fetchPostDetail(id),
	]);

	if (!initialPost) {
		notFound();
	}

	if (!currentUser || currentUser.id !== initialPost.author.id) {
		redirect(`/posts/${id}`);
	}

	return <EditPostPageClient postId={id} initialPost={initialPost} />;
}

