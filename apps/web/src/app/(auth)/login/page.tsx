import Link from "next/link";
import { AuthForm } from "@/features/auth/components/auth-form";

type SearchParams = { error?: string };

type Props = {
  searchParams?: Promise<SearchParams>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const error = params.error;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg-app px-4 py-8">
      <section className="w-full max-w-lg space-y-6 rounded-lg border border-border-muted bg-bg-surface p-8 shadow-card">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-text-primary">로그인</h1>
          <p className="text-sm text-text-secondary">계정에 접속해 게시판을 이용하세요.</p>
        </header>

        {error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        ) : null}

        <AuthForm mode="login" />

        <footer className="text-center text-sm text-text-secondary">
          계정이 없나요? <Link className="text-brand hover:text-brand-hover" href="/register">회원가입</Link>
        </footer>
      </section>
    </main>
  );
}
