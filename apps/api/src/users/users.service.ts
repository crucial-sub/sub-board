// 사용자 CRUD 로직을 담당하는 서비스
import { Injectable } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

// 응답으로 노출 가능한 사용자 정보만 추려낸 타입
export type PublicUser = Pick<
	User,
	"id" | "loginId" | "nickname" | "createdAt" | "updatedAt"
>;

// 회원가입 시 필요한 필드 정의
export type CreateUserInput = {
	loginId: string;
	nickname: string;
	passwordHash: string;
};

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	async createUser({
		loginId,
		nickname,
		passwordHash,
	}: CreateUserInput): Promise<PublicUser> {
		// 사용자 생성 후 공개용 필드만 반환한다
		const user = await this.prisma.user.create({
			data: {
				loginId,
				nickname,
				passwordHash,
			},
		});
		return this.toPublic(user);
	}

	async findByLoginId(loginId: string): Promise<User | null> {
		// 인증 단계에서 로그인 ID로 사용자 탐색에 사용한다
		return this.prisma.user.findUnique({ where: { loginId } });
	}

	async findByNickname(nickname: string): Promise<User | null> {
		// 닉네임 중복 확인이나 프로필 탐색에 활용한다
		return this.prisma.user.findUnique({ where: { nickname } });
	}

	async findById(id: string): Promise<PublicUser | null> {
		// 세션 확인 등에서 사용자 프로필을 조회한다
		const user = await this.prisma.user.findUnique({ where: { id } });
		return user ? this.toPublic(user) : null;
	}

	async updateProfile(
		id: string,
		data: Prisma.UserUpdateInput,
	): Promise<PublicUser> {
		// 프로필 변경 후에도 민감 정보를 숨긴다
		const user = await this.prisma.user.update({
			where: { id },
			data,
		});
		return this.toPublic(user);
	}

	toPublic(user: User): PublicUser {
		// 비밀번호 등 민감 정보는 노출하지 않는다
		const { id, loginId, nickname, createdAt, updatedAt } = user;
		return { id, loginId, nickname, createdAt, updatedAt };
	}

	async getUserStats(userId: string) {
		const [postCount, commentCount, recentPost, tagUsage] =
			await Promise.all([
				this.prisma.post.count({ where: { authorId: userId } }),
				this.prisma.comment.count({ where: { authorId: userId } }),
				this.prisma.post.findFirst({
					where: { authorId: userId },
					select: { id: true, title: true, createdAt: true },
					orderBy: { createdAt: "desc" },
				}),
				this.prisma.tag.findMany({
					where: { posts: { some: { authorId: userId } } },
					select: {
						name: true,
						posts: {
							where: { authorId: userId },
							select: { id: true },
						},
					},
				}),
			]);

		const topTags = tagUsage
			.map((tag) => ({
				name: tag.name,
				count: tag.posts.length,
			}))
			.filter((tag) => tag.count > 0)
			.sort((a, b) => b.count - a.count)
			.slice(0, 3);

		return {
			postCount,
			commentCount,
			topTags,
			lastPost: recentPost
				? {
						id: recentPost.id,
						title: recentPost.title,
						createdAt: recentPost.createdAt,
				  }
				: null,
		};
	}
}
