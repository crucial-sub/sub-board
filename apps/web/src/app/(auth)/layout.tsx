import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sub Board | 인증",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col gap-8 bg-bg-app">
      <header className="border-b border-border-muted bg-white/80 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="text-lg font-semibold text-text-primary">
            Sub Board
          </Link>
          <nav className="flex items-center gap-4 text-sm text-text-secondary">
            <Link href={"/" as const} className="hover:text-text-primary" prefetch={false}>
              게시판
            </Link>
          </nav>
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 pb-12">{children}</div>
    </div>
  );
}
