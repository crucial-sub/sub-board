import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  check() {
    const environment = this.configService.get<string>('NODE_ENV') ?? 'local';
    return {
      status: 'ok',
      environment,
      timestamp: new Date().toISOString(),
    };
  }
}
