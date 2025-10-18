import { useMutation } from "@tanstack/react-query";
import { login, register, LoginPayload, RegisterPayload, AuthResponse } from "../api";

export function useRegisterMutation() {
  return useMutation<AuthResponse, Error, RegisterPayload>({
    mutationFn: register,
  });
}

export function useLoginMutation() {
  return useMutation<AuthResponse, Error, LoginPayload>({
    mutationFn: login,
  });
}
