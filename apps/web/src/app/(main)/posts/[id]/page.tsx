import Link from "next/link";
// 게시글 상세 페이지 라우트를 담당한다
import { PostDetail } from "@/features/posts/components/post-detail";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <Link href="/posts" className="text-sm text-text-secondary hover:text-text-primary">
        ← 목록으로 돌아가기
      </Link>
      <PostDetail id={id} />
    </div>
  );
}
