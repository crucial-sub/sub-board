// 게시글 CRUD 로직을 담당하는 서비스
import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
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

		const tagNames = this.normalizeTags(dto.tags);

		const post = await this.prisma.post.create({
			data: {
				authorId,
				title: dto.title,
				content: dto.content,
				tags: tagNames.length
					? {
							connectOrCreate: tagNames.map((name) => ({
								where: { name },
								create: { name },
							})),
						}
					: undefined,
			},
			include: {
				author: {
					select: { id: true, loginId: true, nickname: true },
				},
				tags: {
					select: { name: true },
				},
			},
		});

		return post;
	}

	async findAll(page = 1, pageSize = 10, keyword?: string, tag?: string) {
		const filters: Prisma.PostWhereInput[] = [];

		const trimmedKeyword = keyword?.trim();
		if (trimmedKeyword) {
			filters.push({
				OR: [
					{
						title: {
							contains: trimmedKeyword,
							mode: Prisma.QueryMode.insensitive,
						},
					},
					{
						content: {
							contains: trimmedKeyword,
							mode: Prisma.QueryMode.insensitive,
						},
					},
					{
						author: {
							is: {
								nickname: {
									contains: trimmedKeyword,
									mode: Prisma.QueryMode.insensitive,
								},
							},
						},
					},
				],
			});
		}

		const trimmedTag = tag?.trim();
		if (trimmedTag) {
			filters.push({
				tags: {
					some: {
						name: trimmedTag,
					},
				},
			});
		}

		const where = filters.length ? { AND: filters } : undefined;

		const [items, total] = await this.prisma.$transaction([
			this.prisma.post.findMany({
				skip: (page - 1) * pageSize,
				take: pageSize,
				orderBy: { createdAt: "desc" },
				where,
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
					tags: {
						select: { name: true },
					},
				},
			}),
			this.prisma.post.count({ where }),
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
				tags: {
					select: { name: true },
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
		const tagNames =
			dto.tags !== undefined ? this.normalizeTags(dto.tags) : undefined;

		return this.prisma.post.update({
			where: { id },
			data: {
				title: dto.title,
				content: dto.content,
				tags:
					tagNames !== undefined
						? {
								set: [],
								connectOrCreate: tagNames.map((name) => ({
									where: { name },
									create: { name },
								})),
							}
						: undefined,
			},
			select: {
				id: true,
				title: true,
				content: true,
				viewCount: true,
				createdAt: true,
				updatedAt: true,
				tags: {
					select: { name: true },
				},
			},
		});
	}

	async remove(id: string, authorId: string) {
		await this.ensureOwnership(id, authorId);
		await this.prisma.post.delete({ where: { id } });
		return { id };
	}

	async listTags() {
		const tags = await this.prisma.tag.findMany({
			orderBy: { name: "asc" },
			include: {
				_count: { select: { posts: true } },
			},
		});

		return tags.map((tag) => ({
			id: tag.id,
			name: tag.name,
			count: tag._count.posts,
		}));
	}

	private async ensureOwnership(id: string, authorId: string) {
		const post = await this.prisma.post.findUnique({
			where: { id },
			select: { authorId: true },
		});
		if (!post) {
			throw new NotFoundException("게시글을 찾을 수 없습니다.");
		}
		if (post.authorId !== authorId) {
			throw new ForbiddenException(
				"게시글을 수정하거나 삭제할 권한이 없습니다.",
			);
		}
	}

	private normalizeTags(tags?: string[]) {
		if (!tags) {
			return [] as string[];
		}

		const seen = new Set<string>();
		const sanitized: string[] = [];

		for (const raw of tags) {
			const normalized = raw.replace(/^#/, "").trim();
			if (!normalized) continue;
			const key = normalized.toLowerCase();
			if (seen.has(key)) continue;
			seen.add(key);
			sanitized.push(normalized.slice(0, 40));
		}

		return sanitized.slice(0, 10);
	}
}
