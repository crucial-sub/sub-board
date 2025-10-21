"use client";

// 사용자 프로필 수정을 수행하는 뮤테이션 훅
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	updateProfile,
	type UpdateProfilePayload,
} from "@/features/users/api";

export function useUpdateProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
		onSuccess: (user) => {
			void queryClient.invalidateQueries({ queryKey: ["user-stats"] });
			return user;
		},
	});
}

