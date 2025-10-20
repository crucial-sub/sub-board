// 시스템 건강 상태를 계산하는 서비스
import { Injectable } from "@nestjs/common";
import { performance } from "node:perf_hooks";
import { PrismaService } from "../prisma/prisma.service";

// 데이터베이스 상태를 표현하기 위한 응답 모델
export type DatabaseHealthStatus = {
	status: "up" | "down";
	latencyMs: number;
	error?: string;
};

@Injectable()
export class HealthService {
	constructor(private readonly prisma: PrismaService) {}

	async checkDatabase(): Promise<DatabaseHealthStatus> {
		// DB에 간단한 쿼리를 날려 응답 속도와 장애 여부를 측정한다
		const started = performance.now();
		try {
			await this.prisma.$queryRaw`SELECT 1`;
			return {
				status: "up",
				latencyMs: Number((performance.now() - started).toFixed(2)),
			};
		} catch (error) {
			return {
				status: "down",
				latencyMs: Number((performance.now() - started).toFixed(2)),
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}
