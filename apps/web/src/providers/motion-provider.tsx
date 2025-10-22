"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Framer Motion LazyMotion Provider
 * domAnimation을 사용하여 필요한 애니메이션 기능만 로드 (번들 크기 최적화)
 */
export function MotionProvider({ children }: { children: ReactNode }) {
	return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
