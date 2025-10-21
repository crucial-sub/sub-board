"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useNotificationStream } from "@/features/notifications/hooks/useNotificationStream";
import { useNotificationStore } from "@/features/notifications/state/notification-store";

export function NotificationToaster() {
	useNotificationStream();
	const notifications = useNotificationStore((state) => state.items);
	const removeNotification = useNotificationStore(
		(state) => state.removeNotification,
	);

	useEffect(() => {
		const timers = notifications.map((notification) =>
			setTimeout(() => removeNotification(notification.id), 8000),
		);
		return () => {
			for (const timer of timers) {
				clearTimeout(timer);
			}
		};
	}, [notifications, removeNotification]);

	if (notifications.length === 0) {
		return null;
	}

	return (
		<div className="pointer-events-none fixed right-6 top-24 z-50 flex w-full max-w-sm flex-col gap-3">
			{notifications.map((notification) => (
				<div
					key={notification.id}
					className="pointer-events-auto rounded-2xl border border-border-muted bg-white/90 p-4 shadow-card backdrop-blur"
				>
					<div className="flex items-start justify-between gap-3">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
								{notification.title}
							</p>
							<p className="mt-2 text-sm text-text-secondary">
								{notification.message}
							</p>
						</div>
						<button
							type="button"
							onClick={() => removeNotification(notification.id)}
							className="rounded-full p-1 text-text-subtle transition hover:text-text-secondary"
							aria-label="알림 닫기"
						>
							✕
						</button>
					</div>
					<Link
						href={notification.href}
						className="mt-3 inline-flex text-xs font-semibold text-brand hover:text-brand-hover"
					>
						바로가기
					</Link>
				</div>
			))}
		</div>
	);
}
