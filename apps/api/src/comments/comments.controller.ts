// 댓글 생성/삭제 HTTP 엔드포인트를 제공하는 컨트롤러
import { Body, Controller, Delete, Param, Post } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CreateCommentDto } from "./dto/create-comment.dto";

@Controller("comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() dto: CreateCommentDto) {
    // TODO: 인증 연동 시 실제 사용자 ID로 교체
    const dummyAuthorId = "test-author-id";
    return this.commentsService.create(dummyAuthorId, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.commentsService.remove(id);
  }
}
