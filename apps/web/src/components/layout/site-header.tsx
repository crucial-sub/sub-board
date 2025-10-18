import Link from "next/link";

const NAV_ITEMS = [
  { href: "/" as const, label: "홈" },
  { href: "/posts" as const, label: "게시판" },
  { href: "/search" as const, label: "검색" },
  { href: "/login" as const, label: "로그인" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-border-muted bg-white/70 backdrop-blur">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="text-lg font-semibold text-text-primary">
          Sub Board
        </Link>
        <nav className="flex items-center gap-5 text-sm text-text-secondary">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-text-primary">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
