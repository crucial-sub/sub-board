/// <reference types="jest" />

// 헬스 체크 엔드포인트를 통합 테스트한다
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("Health (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    // 실제 모듈 구성을 그대로 불러와 테스트용 앱을 만든다
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /health returns service and db status", async () => {
    // /health 호출 결과에 상태 정보가 포함되는지 검증한다
    const { status, body } = await request(app.getHttpServer()).get("/health");

    expect(status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        status: expect.stringMatching(/^(ok|degraded)$/),
        environment: expect.any(String),
        db: expect.objectContaining({
          status: expect.stringMatching(/^(up|down)$/),
          latencyMs: expect.any(Number),
        }),
      }),
    );
  });
});
