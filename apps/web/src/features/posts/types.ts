export type PostTagSummary = {
	id: string;
	name: string;
	count: number;
};

export type PostListItem = {
	id: string;
	title: string;
	content: string;
	viewCount: number;
	createdAt: string;
	updatedAt: string;
	author: {
		id: string;
		loginId: string;
		nickname: string;
	};
	tags: Array<{
		name: string;
	}>;
};

export type PostListResponse = {
	items: PostListItem[];
	total: number;
	page: number;
	pageSize: number;
};

export type PostDetailResponse = PostListItem & {
	comments: Array<{
		id: string;
		content: string;
		createdAt: string;
		author: {
			id: string;
			nickname: string;
		};
	}>;
};
