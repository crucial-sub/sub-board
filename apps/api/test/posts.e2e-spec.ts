/// <reference types="jest" />

// 게시글 API 흐름을 통합 테스트한다
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Posts (e2e)", () => {
	let app: INestApplication;
	let prisma: PrismaService;
	let accessToken: string;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
				forbidNonWhitelisted: true,
				transform: true,
			}),
		);

		prisma = app.get(PrismaService);
		await app.init();
	});

	beforeEach(async () => {
		await prisma.comment.deleteMany();
		await prisma.post.deleteMany();
		await prisma.session.deleteMany();
		await prisma.user.deleteMany();

		// 테스트 유저 등록 후 토큰 확보
		const registerResponse = await request(app.getHttpServer())
			.post("/auth/register")
			.send({
				loginId: "posttester",
				nickname: "게시테스트",
				password: "Password123!",
			});

		accessToken = registerResponse.body.tokens.accessToken;
	});

	afterAll(async () => {
		await app.close();
	});

	it("POST /posts -> creates a new post", async () => {
		const response = await request(app.getHttpServer())
			.post("/posts")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ title: "첫 게시글", content: "내용입니다." });

		expect(response.status).toBe(201);
		expect(response.body.title).toBe("첫 게시글");
		expect(response.body.author).toEqual(
			expect.objectContaining({ loginId: "posttester" }),
		);
	});

	it("PATCH /posts/:id -> updates a post when author matches", async () => {
		const created = await request(app.getHttpServer())
			.post("/posts")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ title: "업데이트 테스트", content: "초기" });

		const response = await request(app.getHttpServer())
			.patch(`/posts/${created.body.id}`)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ title: "수정된 제목" });

		expect(response.status).toBe(200);
		expect(response.body.title).toBe("수정된 제목");
	});

	it("DELETE /posts/:id -> deletes a post when author matches", async () => {
		const created = await request(app.getHttpServer())
			.post("/posts")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ title: "삭제 대상", content: "삭제" });

		const response = await request(app.getHttpServer())
			.delete(`/posts/${created.body.id}`)
			.set("Authorization", `Bearer ${accessToken}`);

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ id: created.body.id });
	});
});
