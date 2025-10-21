"use client";

import { useLogoutMutation } from "@/features/auth/hooks/useAuthMutations";

type Props = {
	className?: string;
};

export function LogoutButton({ className }: Props) {
	const logoutMutation = useLogoutMutation();
	const mergedClassName = [
		"btn-outline disabled:cursor-not-allowed disabled:opacity-60",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<button
			type="button"
			onClick={() => logoutMutation.mutate()}
			disabled={logoutMutation.isPending}
			className={mergedClassName}
		>
			로그아웃
		</button>
	);
}
