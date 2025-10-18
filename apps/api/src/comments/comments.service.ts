// 댓글 CRUD 로직을 담당하는 서비스
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import { CreateCommentDto } from "./dto/create-comment.dto";

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
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

    return this.prisma.comment.create({
      data: {
        postId: dto.postId,
        authorId,
        content: dto.content,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: { id: true, loginId: true, nickname: true },
        },
      },
    });
  }

  async remove(commentId: string) {
    const exists = await this.prisma.comment.count({ where: { id: commentId } });
    if (!exists) {
      throw new NotFoundException("댓글을 찾을 수 없습니다.");
    }
    await this.prisma.comment.delete({ where: { id: commentId } });
    return { id: commentId };
  }
}
