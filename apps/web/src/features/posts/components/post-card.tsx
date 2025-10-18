import Link from "next/link";

export type PostCardProps = {
  id: string;
  title: string;
  viewCount: number;
  createdAt: string;
  author: {
    id: string;
    nickname: string;
  };
};

export function PostCard({ id, title, viewCount, createdAt, author }: PostCardProps) {
  const created = new Date(createdAt);

  return (
    <article className="space-y-3 rounded-lg border border-border-muted bg-white p-5 shadow-card transition hover:shadow-popover">
      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span>{author.nickname}</span>
        <span>{created.toLocaleString()}</span>
      </div>
      <h2 className="text-lg font-semibold text-text-primary">
        <Link href={`/posts/${id}`}>{title}</Link>
      </h2>
      <div className="text-xs text-text-secondary">조회수 {viewCount.toLocaleString()}</div>
    </article>
  );
}
