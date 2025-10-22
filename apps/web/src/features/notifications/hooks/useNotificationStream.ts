"use client";

import { useAuthStore } from "@/features/auth/state/auth-store";
import { useNotificationStore } from "@/features/notifications/state/notification-store";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

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
	author?: {
		id: string;
		nickname: string;
	};
	postAuthorId?: string; // 게시글 작성자 ID (댓글 알림 토스트 필터링용)
	postId?: string; // 게시글 ID (댓글 알림 시 해당 게시글 캐시 무효화용)
};

export function useNotificationStream() {
	const user = useAuthStore((state) => state.user);
	const clearNotifications = useNotificationStore((state) => state.clear);
	const addNotification = useNotificationStore((state) => state.addNotification);
	const removeNotification = useNotificationStore(
		(state) => state.removeNotification,
	);
	const queryClient = useQueryClient();
	const retryTimer = useRef<NodeJS.Timeout | null>(null);
	const dismissTimers = useRef<Set<NodeJS.Timeout>>(new Set());

	useEffect(() => {
		if (!user) {
			clearNotifications();
			dismissTimers.current.forEach(clearTimeout);
			dismissTimers.current.clear();
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

					if (!payload.type || !payload.title || !payload.message) {
						return;
					}

					// 작성자가 현재 사용자인 경우 알림을 표시하지 않음
					if (payload.author?.id === user?.id) {
						console.log("[SSE] 본인 작성 알림은 표시하지 않음");
						return;
					}

					// ⭐ React Query 캐시 무효화 - 실시간으로 리스트 업데이트
					// (모든 사용자가 실시간으로 리스트 업데이트를 받음)
					if (payload.type === "post.created") {
						// 게시글 목록 캐시 무효화
						void queryClient.invalidateQueries({ queryKey: ["posts"] });
						console.log("[SSE] 게시글 목록 캐시 무효화");
					} else if (payload.type === "comment.created" && payload.postId) {
						// 해당 게시글 상세 데이터 캐시 무효화 (댓글이 포함된 게시글 상세)
						void queryClient.invalidateQueries({ queryKey: ["post", payload.postId] });
						console.log(`[SSE] 게시글 ${payload.postId} 캐시 무효화 (댓글 업데이트)`);
					}

					// ⭐ 토스트 알림 표시 조건:
					// - 게시글: 모든 사용자에게 표시
					// - 댓글: 게시글 작성자에게만 표시
					const shouldShowToast =
						payload.type === "post.created" ||
						(payload.type === "comment.created" && payload.postAuthorId === user?.id);

					if (!shouldShowToast) {
						console.log("[SSE] 토스트는 표시하지 않지만 캐시는 무효화됨");
						return;
					}

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

					// Track auto-dismiss timers so we can cancel them during cleanup.
					const timerId = setTimeout(() => {
						removeNotification(id);
						dismissTimers.current.delete(timerId);
					}, AUTO_DISMISS_MS);
					dismissTimers.current.add(timerId);
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
			dismissTimers.current.forEach(clearTimeout);
			dismissTimers.current.clear();
			if (eventSource) {
				eventSource.close();
			}
		};
	}, [user, addNotification, removeNotification, clearNotifications, queryClient]);
}
