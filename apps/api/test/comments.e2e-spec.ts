/// <reference types="jest" />

// 댓글 API 흐름을 통합 테스트한다
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Comments (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let postId: string;

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

    // 테스트 유저를 생성하고 게시글을 하나 만들어 둔다
    const registerResponse = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        loginId: "commenter",
        nickname: "댓글러",
        password: "Password123!",
      });

    accessToken = registerResponse.body.tokens.accessToken;

    const postResponse = await request(app.getHttpServer())
      .post("/posts")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "댓글용 게시글", content: "댓글을 달아봅니다." });

    postId = postResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /comments -> creates a comment for a post", async () => {
    const response = await request(app.getHttpServer())
      .post("/comments")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ postId, content: "첫 댓글!" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        content: "첫 댓글!",
        author: expect.objectContaining({ loginId: "commenter" }),
      }),
    );

    const stored = await prisma.comment.findFirst({ where: { postId } });
    expect(stored?.content).toBe("첫 댓글!");
  });

  it("POST /comments -> rejects when unauthenticated", async () => {
    const response = await request(app.getHttpServer())
      .post("/comments")
      .send({ postId, content: "인증 없음" });

    expect(response.status).toBe(401);
  });

  it("DELETE /comments/:id -> allows the author to delete", async () => {
    const created = await request(app.getHttpServer())
      .post("/comments")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ postId, content: "삭제될 댓글" });

    const response = await request(app.getHttpServer())
      .delete(`/comments/${created.body.id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: created.body.id });
  });

  it("DELETE /comments/:id -> blocks other users", async () => {
    const created = await request(app.getHttpServer())
      .post("/comments")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ postId, content: "타인이 삭제 시도" });

    const otherUserResponse = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        loginId: "other",
        nickname: "다른유저",
        password: "Password123!",
      });

    const otherAccessToken = otherUserResponse.body.tokens.accessToken;

    const response = await request(app.getHttpServer())
      .delete(`/comments/${created.body.id}`)
      .set("Authorization", `Bearer ${otherAccessToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toContain("권한이 없습니다");
  });
});
