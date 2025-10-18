// 게시글 목록 로딩 시 렌더링할 고정 키 목록
const POSTS_LOADING_KEYS = ["loading-1", "loading-2", "loading-3", "loading-4", "loading-5", "loading-6"];

export default function PostsLoading() {
  return (
    <section className="space-y-4">
      {POSTS_LOADING_KEYS.map((key) => (
        <div key={key} className="h-24 animate-pulse rounded-lg bg-border-muted" />
      ))}
    </section>
  );
}
