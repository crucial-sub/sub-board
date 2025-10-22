"use client";

import dynamic from "next/dynamic";

/**
 * NotificationToaster를 동적으로 로드하는 래퍼 컴포넌트
 * SSR을 비활성화하여 초기 번들 크기 감소
 */
const NotificationToaster = dynamic(
	() =>
		// @ts-ignore - dynamic import는 런타임에 해결되므로 TypeScript가 타입을 미리 알 수 없음
		import("@/features/notifications/components/notification-toaster").then(
			(mod) => ({ default: mod.NotificationToaster }),
		),
	{ ssr: false },
);

export function NotificationToasterWrapper() {
	return <NotificationToaster />;
}
