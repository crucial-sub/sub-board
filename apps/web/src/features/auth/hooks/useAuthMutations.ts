import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
	login,
	logout,
	refreshSession,
	register,
	type LoginPayload,
	type RegisterPayload,
	type AuthResponse,
} from "../api";
import { useAuthStore } from "../state/auth-store";

export function useRegisterMutation() {
	const setFromResponse = useAuthStore((state) => state.setFromResponse);
	const router = useRouter();

	return useMutation<AuthResponse, Error, RegisterPayload>({
		mutationFn: register,
		onSuccess: (data) => {
			setFromResponse(data);
			router.push("/posts");
		},
	});
}

export function useLoginMutation() {
	const setFromResponse = useAuthStore((state) => state.setFromResponse);
	const router = useRouter();

	return useMutation<AuthResponse, Error, LoginPayload>({
		mutationFn: login,
		onSuccess: (data) => {
			setFromResponse(data);
			router.push("/posts");
		},
	});
}

export function useLogoutMutation() {
	const clearAuth = useAuthStore((state) => state.clearAuth);
	const router = useRouter();

	return useMutation({
		mutationFn: logout,
		onSuccess: () => {
			clearAuth();
			router.push("/");
		},
	});
}

export function useHydrateAuthSession() {
	const hasHydrated = useAuthStore((state) => state.hasHydrated);
	const setFromResponse = useAuthStore((state) => state.setFromResponse);
	const clearAuth = useAuthStore((state) => state.clearAuth);

	return useMutation({
		mutationKey: ["auth", "hydrate"],
		mutationFn: refreshSession,
		onSuccess: (data) => {
			setFromResponse(data);
		},
		onError: () => {
			if (!hasHydrated) {
				clearAuth();
			}
		},
	});
}
