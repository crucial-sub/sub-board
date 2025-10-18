"use client";

// 초기 렌더 시 쿠키 기반 인증 상태를 동기화하는 훅
import { useEffect } from "react";
import { refreshSession } from "../api";
import { useAuthStore } from "../state/auth-store";

export function useAuthSession() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const setFromResponse = useAuthStore((state) => state.setFromResponse);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const markHydrated = useAuthStore((state) => state.markHydrated);

  useEffect(() => {
    if (hasHydrated) {
      return;
    }

    refreshSession()
      .then((response) => {
        setFromResponse(response);
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => {
        markHydrated();
      });
  }, [clearAuth, hasHydrated, markHydrated, setFromResponse]);
}
