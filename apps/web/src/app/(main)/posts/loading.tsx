export default function PostsLoading() {
  return (
    <section className="space-y-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-24 animate-pulse rounded-lg bg-border-muted" />
      ))}
    </section>
  );
}
