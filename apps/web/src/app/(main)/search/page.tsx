import { SearchPageClient } from "./search-page-client";
import { fetchPostsList } from "@/features/posts/server/queries";

const PAGE_SIZE = 10;

type SearchParams = {
	keyword?: string;
};

type Props = {
	searchParams?: Promise<SearchParams>;
};

export default async function SearchPage({ searchParams }: Props) {
	const params = (await searchParams) ?? {};
	const initialKeyword = (() => {
		if (typeof params.keyword !== "string") {
			return "";
		}
		const trimmed = params.keyword.trim();
		if (!trimmed) {
			return "";
		}
		try {
			return decodeURIComponent(trimmed);
		} catch (_error) {
			return trimmed;
		}
	})();

	const initialResults =
		initialKeyword.length > 0
			? await fetchPostsList({
					page: 1,
					pageSize: PAGE_SIZE,
					keyword: initialKeyword,
				})
			: null;

	return (
		<SearchPageClient
			initialKeyword={initialKeyword}
			initialResults={initialResults}
			pageSize={PAGE_SIZE}
		/>
	);
}
