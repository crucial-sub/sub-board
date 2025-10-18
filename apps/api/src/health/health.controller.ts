// 헬스 체크 엔드포인트를 제공하는 컨트롤러
import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HealthService } from "./health.service";

@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly healthService: HealthService,
  ) {}

  @Get()
  async check() {
    // 현재 실행 환경과 DB 상태 정보를 수집한다
    const environment = this.configService.get<string>('NODE_ENV') ?? 'local';
    const db = await this.healthService.checkDatabase();
    const status = db.status === 'up' ? 'ok' : 'degraded';

    // 헬스 체크 응답에 핵심 상태 정보를 담아 반환한다
    return {
      status,
      environment,
      timestamp: new Date().toISOString(),
      db,
    };
  }
}
