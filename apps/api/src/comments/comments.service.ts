// 댓글 CRUD 로직을 담당하는 서비스
import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import type { CreateCommentDto } from "./dto/create-comment.dto";
import type { UpdateCommentDto } from "./dto/update-comment.dto";

@Injectable()
export class CommentsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly usersService: UsersService,
		private readonly notificationsService: NotificationsService,
	) {}

	async create(authorId: string, dto: CreateCommentDto) {
		const [post, author] = await Promise.all([
			this.prisma.post.findUnique({ where: { id: dto.postId } }),
			this.usersService.findById(authorId),
		]);

		if (!post) {
			throw new NotFoundException("게시글을 찾을 수 없습니다.");
		}
		if (!author) {
			throw new NotFoundException("작성자를 찾을 수 없습니다.");
		}

		const comment = await this.prisma.comment.create({
			data: {
				postId: dto.postId,
				authorId,
				content: dto.content,
			},
			select: {
				id: true,
				content: true,
				createdAt: true,
				updatedAt: true,
				author: {
					select: { id: true, loginId: true, nickname: true },
				},
			},
		});

		// 댓글 생성 이벤트를 모든 사용자에게 broadcast
		// (실시간 댓글 리스트 업데이트를 위해)
		const excerpt = comment.content.length > 50
			? `${comment.content.slice(0, 47)}...`
			: comment.content;
		const event = this.notificationsService.createCommentCreatedEvent({
			postId: dto.postId,
			commentId: comment.id,
			commentExcerpt: excerpt,
			commentAuthor: {
				id: comment.author.id,
				nickname: comment.author.nickname,
			},
			postAuthorId: post.authorId, // 프론트엔드에서 토스트 필터링용
		});
		this.notificationsService.broadcast(event);

		return comment;
	}

	async remove(commentId: string, authorId: string) {
		const comment = await this.prisma.comment.findUnique({
			where: { id: commentId },
			select: { authorId: true },
		});
		if (!comment) {
			throw new NotFoundException("댓글을 찾을 수 없습니다.");
		}
		if (comment.authorId !== authorId) {
			throw new ForbiddenException("댓글을 삭제할 권한이 없습니다.");
		}

		await this.prisma.comment.delete({ where: { id: commentId } });
		return { id: commentId };
	}

	async update(commentId: string, authorId: string, dto: UpdateCommentDto) {
		const comment = await this.prisma.comment.findUnique({
			where: { id: commentId },
			select: { authorId: true },
		});
		if (!comment) {
			throw new NotFoundException("댓글을 찾을 수 없습니다.");
		}
		if (comment.authorId !== authorId) {
			throw new ForbiddenException("댓글을 수정할 권한이 없습니다.");
		}

		const nextContent = dto.content.trim();

		return this.prisma.comment.update({
			where: { id: commentId },
			data: { content: nextContent },
			select: {
				id: true,
				content: true,
				createdAt: true,
				updatedAt: true,
				author: {
					select: { id: true, loginId: true, nickname: true },
				},
			},
		});
	}
}
