import Link from "next/link";
import { PostDetail } from "@/features/posts/components/post-detail";

export default function PostDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <Link href="/posts" className="text-sm text-text-secondary hover:text-text-primary">
        ← 목록으로 돌아가기
      </Link>
      <PostDetail id={params.id} />
    </div>
  );
}
