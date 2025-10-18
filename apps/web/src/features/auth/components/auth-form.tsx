"use client";

import { useLoginMutation, useRegisterMutation } from "../hooks/useAuthMutations";
import { useState } from "react";

export type AuthFormMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthFormMode }) {
  const [loginId, setLoginId] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");

  const registerMutation = useRegisterMutation();
  const loginMutation = useLoginMutation();

  const isRegister = mode === "register";
  const isLoading = registerMutation.isPending || loginMutation.isPending;
  const error = registerMutation.error || loginMutation.error;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isRegister) {
      await registerMutation.mutateAsync({ loginId, nickname, password });
    } else {
      await loginMutation.mutateAsync({ loginId, password });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-secondary" htmlFor="loginId">
          로그인 ID
        </label>
        <input
          id="loginId"
          type="text"
          required
          value={loginId}
          onChange={(event) => setLoginId(event.target.value)}
          className="w-full rounded-md border border-border-muted bg-white px-3 py-2 text-text-primary shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>

      {isRegister ? (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary" htmlFor="nickname">
            닉네임
          </label>
          <input
            id="nickname"
            type="text"
            required
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            className="w-full rounded-md border border-border-muted bg-white px-3 py-2 text-text-primary shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-secondary" htmlFor="password">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-md border border-border-muted bg-white px-3 py-2 text-text-primary shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>

      {error ? <p className="text-sm text-red-500">{error.message}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-brand px-4 py-2 text-sm font-medium text-white shadow-card transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRegister ? "회원가입" : "로그인"}
      </button>
    </form>
  );
}
