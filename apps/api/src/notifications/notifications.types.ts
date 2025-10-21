export type NotificationEvent = {
	id: string;
	type: "post.created" | "comment.created";
	title: string;
	message: string;
	href: string;
	createdAt: string;
	author?: {
		id: string;
		nickname: string;
	};
};
