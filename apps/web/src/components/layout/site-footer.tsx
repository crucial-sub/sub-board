export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border-muted bg-white/70 py-6 text-sm text-text-secondary backdrop-blur">
      <div className="container flex items-center justify-between">
        <p>&copy; {year} Sub Board. All rights reserved.</p>
        <p className="text-xs">Made with Next.js, Tailwind CSS, and React Query.</p>
      </div>
    </footer>
  );
}
