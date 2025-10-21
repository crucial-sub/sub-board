"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/features/auth/state/auth-store";
import { useNotificationStore } from "@/features/notifications/state/notification-store";

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
const RETRY_DELAY = 5000;
const AUTO_DISMISS_MS = 6000;

type NotificationEvent = {
	id?: string;
	type: "post.created" | "comment.created";
	title: string;
	message: string;
	href?: string;
	createdAt?: string;
};

export function useNotificationStream() {
	const user = useAuthStore((state) => state.user);
	const clearNotifications = useNotificationStore((state) => state.clear);
	const addNotification = useNotificationStore((state) => state.addNotification);
	const removeNotification = useNotificationStore(
		(state) => state.removeNotification,
	);
	const retryTimer = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (!user) {
			clearNotifications();
			return undefined;
		}

		let eventSource: EventSource | null = null;

		const connect = () => {
			const streamUrl = `${API_BASE_URL}/notifications/stream`;
			const nextSource = new EventSource(streamUrl, {
				withCredentials: true,
			});

			nextSource.onmessage = (event) => {
				try {
					const payload = JSON.parse(event.data) as NotificationEvent;
					const id = payload.id ?? crypto.randomUUID();
					const href = payload.href ?? "/";
					const createdAt = payload.createdAt ?? new Date().toISOString();

					addNotification({
						id,
						type: payload.type,
						title: payload.title,
						message: payload.message,
						href,
						createdAt,
					});

					setTimeout(() => removeNotification(id), AUTO_DISMISS_MS);
				} catch (_error) {
					// 무시: 잘못된 이벤트 포맷
				}
			};

			nextSource.onerror = () => {
				if (eventSource) {
					eventSource.close();
				}
				if (retryTimer.current) {
					clearTimeout(retryTimer.current);
				}
				retryTimer.current = setTimeout(connect, RETRY_DELAY);
			};

			if (eventSource) {
				eventSource.close();
			}
			eventSource = nextSource;
		};

		connect();

		return () => {
			if (retryTimer.current) {
				clearTimeout(retryTimer.current);
				retryTimer.current = null;
			}
			if (eventSource) {
				eventSource.close();
			}
		};
	}, [user, addNotification, removeNotification, clearNotifications]);
}
