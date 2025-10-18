"use client";

import Link from "next/link";
import { useAuthStore } from "@/features/auth/state/auth-store";

const NAV_ITEMS = [
  { href: "/" as const, label: "홈" },
  { href: "/posts" as const, label: "게시판" },
  { href: "/search" as const, label: "검색" },
];

export function SiteHeader() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

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
          {user ? (
            <button
              type="button"
              onClick={clearAuth}
              className="rounded-md border border-border-muted px-3 py-1 text-text-primary transition hover:border-brand hover:text-brand"
            >
              로그아웃
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-border-muted px-3 py-1 text-text-primary transition hover:border-brand hover:text-brand"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
