import { PostList } from "@/features/posts/components/post-list";

export default function PostsPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-text-primary">게시판</h1>
        <p className="text-text-secondary">최근 게시글을 한눈에 확인하고 토론에 참여하세요.</p>
      </header>
      <PostList />
    </section>
  );
}
