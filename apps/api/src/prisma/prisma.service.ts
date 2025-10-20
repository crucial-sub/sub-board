// Prisma 클라이언트를 Nest 생태계에 맞춰 감싸는 서비스
import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	private readonly logger = new Logger(PrismaService.name);

	constructor(configService: ConfigService) {
		// 환경 변수 기반으로 데이터베이스 연결 정보를 주입한다
		const databaseUrl = configService.get<string>("DATABASE_URL");
		super(
			databaseUrl
				? {
						datasources: {
							db: {
								url: databaseUrl,
							},
						},
					}
				: undefined,
		);
	}

	async onModuleInit(): Promise<void> {
		// 서비스 초기화 시 DB 연결을 시도하고 실패는 로그로만 남긴다
		try {
			await this.$connect();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unknown Prisma error";
			this.logger.warn(`Skipping initial Prisma connection: ${message}`);
		}
	}

	async onModuleDestroy(): Promise<void> {
		// 애플리케이션 종료 단계에서 연결을 정리해 리소스를 회수한다
		try {
			await this.$disconnect();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unknown Prisma error";
			this.logger.warn(`Error while disconnecting Prisma: ${message}`);
		}
	}
}
