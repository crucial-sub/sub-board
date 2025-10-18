// 애플리케이션 부트스트랩을 책임지는 진입점 파일
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  // Nest 앱 인스턴스를 생성하고 런타임 옵션을 설정한다
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");
  const config = app.get(ConfigService);

  // 요청 DTO를 안전하게 검증하기 위한 전역 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const globalPrefix = config.get<string>("API_GLOBAL_PREFIX");
  if (globalPrefix) {
    app.setGlobalPrefix(globalPrefix);
  }

  // 지정된 오리진만 허용하거나 기본적으로 모든 요청을 허용한다
  const corsOrigin = config.get<string>("CORS_ORIGIN");
  app.enableCors({
    origin: corsOrigin
      ? corsOrigin.split(",").map((origin) => origin.trim())
      : true,
    credentials: true,
  });

  // 지정된 포트로 서버를 실행하고 접속 가능한 주소를 로그로 남긴다
  const port = config.get<number>("API_PORT") ?? 3002;
  const basePath = globalPrefix ? `/${globalPrefix}` : "";
  await app.listen(port);
  logger.log(`API running on http://localhost:${port}${basePath}`);
}

bootstrap().catch((error) => {
  const logger = new Logger("Bootstrap");
  logger.error("Failed to bootstrap API server", error);
  process.exit(1);
});
