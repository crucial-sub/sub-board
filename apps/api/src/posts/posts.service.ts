// 게시글 CRUD 로직을 담당하는 서비스
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(authorId: string, dto: CreatePostDto) {
    const user = await this.usersService.findById(authorId);
    if (!user) {
      throw new NotFoundException("작성자를 찾을 수 없습니다.");
    }

    const post = await this.prisma.post.create({
      data: {
        authorId,
        title: dto.title,
        content: dto.content,
      },
      include: {
        author: {
          select: { id: true, loginId: true, nickname: true },
        },
      },
    });

    return post;
  }

  async findAll(page = 1, pageSize = 10) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: { id: true, loginId: true, nickname: true },
          },
        },
      }),
      this.prisma.post.count(),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: { id: true, loginId: true, nickname: true },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: { id: true, loginId: true, nickname: true },
            },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException("게시글을 찾을 수 없습니다.");
    }

    await this.prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return post;
  }

  async update(id: string, authorId: string, dto: UpdatePostDto) {
    await this.ensureOwnership(id, authorId);
    return this.prisma.post.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        title: true,
        content: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string, authorId: string) {
    await this.ensureOwnership(id, authorId);
    await this.prisma.post.delete({ where: { id } });
    return { id };
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.post.count({ where: { id } });
    if (!exists) {
      throw new NotFoundException("게시글을 찾을 수 없습니다.");
    }
  }

  private async ensureOwnership(id: string, authorId: string) {
    const post = await this.prisma.post.findUnique({ where: { id }, select: { authorId: true } });
    if (!post) {
      throw new NotFoundException("게시글을 찾을 수 없습니다.");
    }
    if (post.authorId !== authorId) {
      throw new ForbiddenException("게시글을 수정하거나 삭제할 권한이 없습니다.");
    }
  }
}
