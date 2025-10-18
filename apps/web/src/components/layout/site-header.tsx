"use client";

// 프런트 전역 상단 내비게이션 바를 렌더링한다
import Link from "next/link";
import { useAuthStore } from "@/features/auth/state/auth-store";
import { useLogoutMutation } from "@/features/auth/hooks/useAuthMutations";

const NAV_ITEMS = [
  { href: "/" as const, label: "홈" },
  { href: "/posts" as const, label: "게시판" },
  { href: "/search" as const, label: "검색" },
  { href: "/posts/new" as const, label: "글 작성" },
];

export function SiteHeader() {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogoutMutation();

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
            <div className="flex items-center gap-3 text-text-primary">
              <span className="hidden text-sm font-medium sm:inline">{user.nickname}님</span>
              <button
                type="button"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="rounded-md border border-border-muted px-3 py-1 text-text-primary transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
              >
                로그아웃
              </button>
            </div>
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
