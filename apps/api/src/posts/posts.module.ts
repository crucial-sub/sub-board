// 게시글 도메인을 묶어 주는 모듈
import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { UsersModule } from "../users/users.module";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";

@Module({
	imports: [PrismaModule, UsersModule],
	controllers: [PostsController],
	providers: [PostsService],
	exports: [PostsService],
})
export class PostsModule {}
