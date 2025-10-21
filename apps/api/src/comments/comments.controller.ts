// 댓글 생성/삭제 HTTP 엔드포인트를 제공하는 컨트롤러
import {
	Body,
	Controller,
	Delete,
	Param,
	Patch,
	Post,
	UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CommentsService } from "./comments.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";

@Controller("comments")
export class CommentsController {
	constructor(private readonly commentsService: CommentsService) {}

	@UseGuards(JwtAuthGuard)
	@Post()
	create(
		@Body() dto: CreateCommentDto,
		@CurrentUser() user: { userId: string },
	) {
		return this.commentsService.create(user.userId, dto);
	}

	@UseGuards(JwtAuthGuard)
	@Delete(":id")
	remove(@Param("id") id: string, @CurrentUser() user: { userId: string }) {
		return this.commentsService.remove(id, user.userId);
	}

	@UseGuards(JwtAuthGuard)
	@Patch(":id")
	update(
		@Param("id") id: string,
		@Body() dto: UpdateCommentDto,
		@CurrentUser() user: { userId: string },
	) {
		return this.commentsService.update(id, user.userId, dto);
	}
}
