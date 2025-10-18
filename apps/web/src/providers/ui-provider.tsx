"use client";

import { ReactNode } from "react";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";

export function UiProvider({ children }: { children: ReactNode }) {
  useAuthSession();
  return children;
}
