import { PostCardSkeleton } from "@/components/ui/skeleton";

// 게시글 목록 로딩 시 렌더링할 고정 키 목록
const POSTS_LOADING_KEYS = [
	"loading-1",
	"loading-2",
	"loading-3",
	"loading-4",
	"loading-5",
	"loading-6",
];

export default function PostsLoading() {
	return (
		<section className="space-y-4" role="status" aria-label="게시글 로딩 중">
			{POSTS_LOADING_KEYS.map((key) => (
				<PostCardSkeleton key={key} />
			))}
		</section>
	);
}
