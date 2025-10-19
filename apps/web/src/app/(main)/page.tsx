'use client';

import Link from "next/link";
import { useAuthStore } from "@/features/auth/state/auth-store";

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const secondaryCta = !hasHydrated ? null : user ? (
    <Link
      href={{ pathname: "/posts/new" }}
      className="rounded-md border border-border-muted bg-white px-4 py-2 text-sm font-semibold text-text-primary shadow-sm transition hover:border-brand hover:text-brand"
    >
      새 글 작성
    </Link>
  ) : (
    <Link
      href={{ pathname: "/login" }}
      className="rounded-md border border-border-muted bg-white px-4 py-2 text-sm font-semibold text-text-primary shadow-sm transition hover:border-brand hover:text-brand"
    >
      로그인
    </Link>
  );

  return (
    <section className="space-y-6 py-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-text-primary">Sub Board에 오신 것을 환영합니다</h1>
        <p className="max-w-2xl text-lg text-text-secondary">
          Next.js, React Query, Tailwind CSS로 구성된 학습용 게시판 프로젝트입니다. 로그인 후 글을 작성하고
          토론에 참여해 보세요.
        </p>
        <div className="flex gap-3">
          <Link
            href={{ pathname: "/posts" }}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-hover"
          >
            게시판 바로가기
          </Link>
          {secondaryCta}
        </div>
      </div>
    </section>
  );
}
