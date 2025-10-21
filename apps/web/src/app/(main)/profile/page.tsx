"use client";

// 사용자 프로필을 수정하는 페이지
import { useEffect, useState } from "react";
import { useAuthGuard } from "@/features/auth/hooks/useAuthGuard";
import { useAuthStore } from "@/features/auth/state/auth-store";
import { useUpdateProfile } from "@/features/users/hooks/useUpdateProfile";

export default function ProfilePage() {
	useAuthGuard();
	const user = useAuthStore((state) => state.user);
	const setUser = useAuthStore((state) => state.setUser);
	const mutation = useUpdateProfile();
	const [nickname, setNickname] = useState(user?.nickname ?? "");
	const [successMessage, setSuccessMessage] = useState("");

	useEffect(() => {
		setNickname(user?.nickname ?? "");
	}, [user?.nickname]);

	useEffect(() => {
		if (!successMessage) {
			return;
		}
		const timer = window.setTimeout(() => setSuccessMessage(""), 3000);
		return () => window.clearTimeout(timer);
	}, [successMessage]);

	const errorMessage =
		mutation.error?.message ?? "프로필 업데이트에 실패했습니다.";

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const trimmed = nickname.trim();
		if (!trimmed || !user) return;

		try {
			const updated = await mutation.mutateAsync({ nickname: trimmed });
			setUser(updated);
			setSuccessMessage("프로필이 업데이트되었습니다.");
		} catch (_error) {
			// 에러는 mutation.error를 통해 출력
		}
	};

	if (!user) {
		return null;
	}

	return (
		<section className="space-y-8">
			<header className="surface-card space-y-3 px-8 py-10">
				<p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
					Account settings
				</p>
				<h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">
					<span className="gradient-text">프로필 관리</span>
				</h1>
				<p className="text-text-secondary">
					닉네임을 변경해 커뮤니티에서 보여지는 프로필을 관리하세요.
				</p>
			</header>

			<form
				onSubmit={handleSubmit}
				className="surface-card max-w-xl space-y-6 px-8 py-10"
			>
				<div className="space-y-2">
					<label className="text-sm font-medium text-text-secondary">
						로그인 ID
					</label>
					<input
						type="text"
						value={user.loginId}
						disabled
						className="w-full rounded-2xl border border-border-muted bg-white/60 px-4 py-3 text-sm text-text-secondary"
					/>
				</div>
				<div className="space-y-2">
					<label
						className="text-sm font-medium text-text-secondary"
						htmlFor="profile-nickname"
					>
						닉네임
					</label>
					<input
						id="profile-nickname"
						type="text"
						value={nickname}
						onChange={(event) => setNickname(event.target.value)}
						className="w-full rounded-2xl border border-border-muted bg-white/80 px-4 py-3 text-sm text-text-primary shadow-card focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
						minLength={2}
						maxLength={20}
						required
					/>
					<p className="text-xs text-text-secondary">
						2~20자의 한글, 영문, 숫자를 사용할 수 있습니다.
					</p>
				</div>

				{successMessage ? (
					<p className="text-sm text-brand">{successMessage}</p>
				) : null}

				{mutation.error ? (
					<p className="text-sm text-red-400">{errorMessage}</p>
				) : null}

				<button
					type="submit"
					disabled={mutation.isPending}
					className="btn-gradient inline-flex w-full items-center justify-center disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
				>
					{mutation.isPending ? "저장 중..." : "저장하기"}
				</button>
			</form>
		</section>
	);
}

