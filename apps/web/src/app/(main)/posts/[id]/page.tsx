import Link from "next/link";

export default function PostDetailPage({ params }: { params: { id: string } }) {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <Link href="/posts" className="text-sm text-text-secondary hover:text-text-primary">
          ← 목록으로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold text-text-primary">게시글 #{params.id}</h1>
      </header>
      <p className="text-text-secondary">게시글 상세 내용은 곧 구현될 예정입니다.</p>
    </article>
  );
}
