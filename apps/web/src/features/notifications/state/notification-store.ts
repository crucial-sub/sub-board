"use client";

import { create } from "zustand";

export type NotificationItem = {
	id: string;
	type: "post.created" | "comment.created";
	title: string;
	message: string;
	href: string;
	createdAt: string;
};

type NotificationState = {
	items: NotificationItem[];
	addNotification: (notification: NotificationItem) => void;
	removeNotification: (id: string) => void;
	clear: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
	items: [],
	addNotification: (notification) =>
		set((state) => ({
			items: [notification, ...state.items].slice(0, 10),
		})),
	removeNotification: (id) =>
		set((state) => ({
			items: state.items.filter((item) => item.id !== id),
		})),
	clear: () => set({ items: [] }),
}));
