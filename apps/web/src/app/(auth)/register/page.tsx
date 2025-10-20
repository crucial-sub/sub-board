import Link from "next/link";
import { AuthForm } from "@/features/auth/components/auth-form";

type SearchParams = { error?: string };

type Props = {
	searchParams?: Promise<SearchParams>;
};

export default async function RegisterPage({ searchParams }: Props) {
	const params = (await searchParams) ?? {};
	const error = params.error;

	return (
		<main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
			<section className="w-full max-w-lg space-y-6 surface-card px-8 py-10">
				<header className="space-y-3 text-center">
					<p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand">
						Create account
					</p>
					<h1 className="text-2xl font-semibold text-text-primary">
						<span className="gradient-text text-3xl">회원가입</span>
					</h1>
					<p className="text-sm text-text-secondary">
						필수 정보를 입력하여 새 계정을 만들어 주세요.
					</p>
				</header>

				{error ? (
					<p className="rounded-2xl border border-red-200 bg-red-100/70 px-4 py-3 text-sm text-red-600">
						{error}
					</p>
				) : null}

				<AuthForm mode="register" />

				<footer className="text-center text-sm text-text-secondary">
					이미 계정이 있나요?{" "}
					<Link
						className="text-brand hover:text-brand-hover"
						href="/login"
					>
						로그인
					</Link>
				</footer>
			</section>
		</main>
	);
}
