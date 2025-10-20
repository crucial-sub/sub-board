/// <reference types="jest" />

// 인증 시나리오를 통합 테스트한다
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Auth (e2e)", () => {
	let app: INestApplication;
	let prisma: PrismaService;

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
		await prisma.session.deleteMany();
		await prisma.user.deleteMany();
	});

	afterAll(async () => {
		await app.close();
	});

	it("POST /auth/register - creates a new user and session", async () => {
		const response = await request(app.getHttpServer())
			.post("/auth/register")
			.send({
				loginId: "jungle123",
				nickname: "jungler",
				password: "password123!",
			});

		expect(response.status).toBe(201);
		expect(response.body.user).toEqual(
			expect.objectContaining({
				loginId: "jungle123",
				nickname: "jungler",
			}),
		);
		expect(response.body.tokens).toEqual(
			expect.objectContaining({
				accessToken: expect.any(String),
				refreshToken: expect.any(String),
				accessTokenExpiresIn: expect.any(Number),
				refreshTokenExpiresIn: expect.any(Number),
			}),
		);
	});

	it("POST /auth/login - signs in an existing user", async () => {
		await request(app.getHttpServer()).post("/auth/register").send({
			loginId: "jungle321",
			nickname: "jungledude",
			password: "password123!",
		});

		const response = await request(app.getHttpServer())
			.post("/auth/login")
			.send({
				loginId: "jungle321",
				password: "password123!",
			});

		expect(response.status).toBe(200);
		expect(response.body.user).toEqual(
			expect.objectContaining({
				loginId: "jungle321",
				nickname: "jungledude",
			}),
		);
		expect(response.body.tokens.accessToken).toEqual(expect.any(String));
		expect(response.body.tokens.refreshToken).toEqual(expect.any(String));
	});
});
