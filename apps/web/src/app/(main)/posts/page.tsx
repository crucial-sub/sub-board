import { PostsPageClient } from "./posts-page-client";
import {
	fetchPostsList,
	fetchPostsTags,
} from "@/features/posts/server/queries";

type SearchParams = {
	tag?: string;
};

type Props = {
	searchParams?: Promise<SearchParams>;
};

export default async function PostsPage({ searchParams }: Props) {
	const params = (await searchParams) ?? {};
	const selectedTag = (() => {
		if (typeof params.tag !== "string" || params.tag.length === 0) {
			return undefined;
		}
		try {
			return decodeURIComponent(params.tag);
		} catch (_error) {
			return params.tag;
		}
	})();

	const [initialTags, initialPosts] = await Promise.all([
		fetchPostsTags(),
		fetchPostsList({ page: 1, pageSize: 12, tag: selectedTag }),
	]);

	return (
		<PostsPageClient
			initialTag={selectedTag}
			initialTags={initialTags}
			initialPosts={initialPosts}
		/>
	);
}
