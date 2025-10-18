import { useMutation } from "@tanstack/react-query";
import { login, register, type LoginPayload, type RegisterPayload, type AuthResponse } from "../api";
import { useAuthStore } from "../state/auth-store";

export function useRegisterMutation() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<AuthResponse, Error, RegisterPayload>({
    mutationFn: register,
    onSuccess: (data) => {
      setAuth(data);
    },
  });
}

export function useLoginMutation() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<AuthResponse, Error, LoginPayload>({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data);
    },
  });
}
