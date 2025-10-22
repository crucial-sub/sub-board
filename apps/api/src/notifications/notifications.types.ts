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
	postAuthorId?: string; // 게시글 작성자 ID (댓글 알림 토스트 필터링용)
	postId?: string; // 게시글 ID (댓글 알림 시 해당 게시글 캐시 무효화용)
};
