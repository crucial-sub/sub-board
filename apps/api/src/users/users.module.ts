// 사용자 관련 의존성을 묶는 모듈
import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";

@Module({
	imports: [PrismaModule],
	providers: [UsersService],
	controllers: [UsersController],
	exports: [UsersService],
})
export class UsersModule {}
