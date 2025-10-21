import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { Observable, Subject } from "rxjs";
import { finalize } from "rxjs/operators";
import { NotificationEvent } from "./notifications.types";

@Injectable()
export class NotificationsService {
	private readonly streams = new Map<string, Set<Subject<NotificationEvent>>>();

	register(userId: string): Observable<NotificationEvent> {
		const subject = new Subject<NotificationEvent>();
		const listeners = this.streams.get(userId) ?? new Set();
		listeners.add(subject);
		this.streams.set(userId, listeners);

		return subject.asObservable().pipe(
			finalize(() => {
				subject.complete();
				const current = this.streams.get(userId);
				if (!current) {
					return;
				}
				current.delete(subject);
				if (current.size === 0) {
					this.streams.delete(userId);
				}
			}),
		);
	}

	broadcast(event: NotificationEvent) {
		for (const subjects of this.streams.values()) {
			for (const subject of subjects) {
				subject.next(event);
			}
		}
	}

	notifyUser(userId: string, event: NotificationEvent) {
		const subjects = this.streams.get(userId);
		if (!subjects) {
			return;
		}
		for (const subject of subjects) {
			subject.next(event);
		}
	}

	notifyUsers(userIds: Iterable<string>, event: NotificationEvent) {
		const unique = new Set(userIds);
		for (const userId of unique) {
			this.notifyUser(userId, event);
		}
	}

	createPostCreatedEvent(payload: {
		postId: string;
		title: string;
		author: { id: string; nickname: string };
	}): NotificationEvent {
		return {
			id: randomUUID(),
			type: "post.created",
			title: "새 게시글",
			message: `${payload.author.nickname}님이 "${payload.title}" 글을 작성했어요.`,
			href: `/posts/${payload.postId}`,
			createdAt: new Date().toISOString(),
			author: payload.author,
		};
	}

	createCommentCreatedEvent(payload: {
		postId: string;
		commentId: string;
		commentExcerpt: string;
		commentAuthor: { id: string; nickname: string };
	}): NotificationEvent {
		return {
			id: randomUUID(),
			type: "comment.created",
			title: "새 댓글",
			message: `${payload.commentAuthor.nickname}님: ${payload.commentExcerpt}`,
			href: `/posts/${payload.postId}#comment-${payload.commentId}`,
			createdAt: new Date().toISOString(),
			author: payload.commentAuthor,
		};
	}
}
