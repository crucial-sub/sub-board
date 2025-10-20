// 인증 관련 의존성을 묶는 모듈
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { PrismaModule } from "../prisma/prisma.module";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
	imports: [
		UsersModule,
		PrismaModule,
		PassportModule.register({ defaultStrategy: "jwt" }),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				const secret =
					configService.get<string>("JWT_ACCESS_SECRET") ??
					"test-access-secret";
				const expiresIn = Number(
					configService.get<string>("JWT_ACCESS_EXPIRES_IN") ?? "900",
				);
				return {
					secret,
					signOptions: { expiresIn },
				};
			},
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, JwtAuthGuard],
	exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
