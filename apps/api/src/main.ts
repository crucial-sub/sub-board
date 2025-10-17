import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");
  const config = app.get(ConfigService);

  const globalPrefix = config.get<string>("API_GLOBAL_PREFIX");
  if (globalPrefix) {
    app.setGlobalPrefix(globalPrefix);
  }

  const corsOrigin = config.get<string>("CORS_ORIGIN");
  app.enableCors({
    origin: corsOrigin
      ? corsOrigin.split(",").map((origin) => origin.trim())
      : true,
    credentials: true,
  });

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
