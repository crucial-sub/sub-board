import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
	console.log("🔄 Clearing existing data...");
	await prisma.comment.deleteMany();
	await prisma.post.deleteMany();
	await prisma.session.deleteMany();
	await prisma.user.deleteMany();

	const users = [
		{ loginId: "jane", nickname: "제인", password: "Password123!" },
		{ loginId: "tom", nickname: "탐", password: "Password123!" },
		{ loginId: "sara", nickname: "사라", password: "Password123!" },
	];

	console.log("👤 Creating users...");
	const createdUsers = await Promise.all(
		users.map(async (user) =>
			prisma.user.create({
				data: {
					loginId: user.loginId,
					nickname: user.nickname,
					passwordHash: await argon2.hash(user.password),
				},
			}),
		),
	);

	const topics = [
		"Next.js",
		"React Query",
		"Prisma",
		"Tailwind",
		"테스트 전략",
		"배포",
		"CI/CD",
		"상태 관리",
		"성능 최적화",
		"UI/UX",
	];

	const postsSeed = [
		{
			title: "Next.js 15 신규 기능 정리",
			content:
				"Next.js 15에서 추가된 라우팅과 서버 액션을 직접 사용해본 경험을 공유합니다. 핵심 포인트와 주의할 점을 정리했어요.",
			author: createdUsers[0],
			tags: ["Next.js", "업데이트"],
		},
		{
			title: "주간 스터디 모집 공지",
			content:
				"매주 토요일 오전에 열리는 프론트엔드 스터디입니다. React, TypeScript 위주로 학습하고 함께 프로젝트를 진행해요.",
			author: createdUsers[0],
			tags: ["스터디", "공지"],
		},
		{
			title: "Prisma 성능 튜닝 팁",
			content:
				"Prisma를 사용하면서 겪었던 N+1 쿼리 이슈와 해결 방법, 인덱스 설계 팁을 정리했습니다.",
			author: createdUsers[1],
			tags: ["Prisma", "성능"],
		},
		{
			title: "Tailwind CSS 유틸리티 정리",
			content:
				"프로덕션에서 자주 사용하는 Tailwind CSS 유틸리티 클래스를 용도별로 정리했습니다. 컴포넌트 라이브러리와 함께 사용할 때 팁도 있어요.",
			author: createdUsers[1],
			tags: ["Tailwind", "디자인"],
		},
		{
			title: "React Query 캐싱 전략",
			content:
				"React Query를 사용할 때 서버 상태와 폼 상태를 어떻게 분리하는지, invalidateQueries를 언제 호출해야 하는지 다룹니다.",
			author: createdUsers[2],
			tags: ["React Query", "캐싱"],
		},
		{
			title: "JWT 인증 구조 이해하기",
			content:
				"액세스 토큰과 리프레시 토큰을 분리해서 관리할 때 주의해야 할 점과 서버-클라이언트 간 동기화 전략을 공유합니다.",
			author: createdUsers[2],
			tags: ["인증", "JWT"],
		},
		...Array.from({ length: 24 }).map((_, index) => {
			const author = createdUsers[index % createdUsers.length];
			const topic = topics[index % topics.length];
			return {
				title: `${topic} 실전 팁 #${index + 1}`,
				content: `${topic} 주제로 프로젝트에서 겪었던 실전 팁을 공유합니다. 케이스 스터디와 함께 리팩터링 아이디어를 정리했습니다.`,
				author,
				tags: [topic, index % 2 === 0 ? "노하우" : "Best Practices"],
			};
		}),
	];

	console.log("📝 Creating posts and comments...");
	for (const postSeed of postsSeed) {
		const post = await prisma.post.create({
			data: {
				title: postSeed.title,
				content: postSeed.content,
				authorId: postSeed.author.id,
				tags: {
					connectOrCreate: postSeed.tags.map((name) => ({
						where: { name },
						create: { name },
					})),
				},
			},
		});

		const otherUsers = createdUsers.filter(
			(user) => user.id !== postSeed.author.id,
		);
		await prisma.comment.createMany({
			data: otherUsers.map((user, index) => ({
				postId: post.id,
				authorId: user.id,
				content: `${user.nickname}의 댓글 ${index + 1}. ${postSeed.title}에 대한 생각을 남겨봅니다!`,
			})),
		});
	}

	console.log(
		"✅ Seeding completed. Users can log in with password 'Password123!'",
	);
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
