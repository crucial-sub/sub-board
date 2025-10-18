// 게시글 CRUD HTTP 엔드포인트를 제공하는 컨트롤러
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PostsService } from "./posts.service";

@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() dto: CreatePostDto) {
    // TODO: 실제 인증 사용자 ID로 교체 필요
    const dummyAuthorId = "test-author-id";
    return this.postsService.create(dummyAuthorId, dto);
  }

  @Get()
  findAll(@Query("page") page?: string, @Query("pageSize") pageSize?: string) {
    return this.postsService.findAll(Number(page ?? "1"), Number(pageSize ?? "10"));
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.postsService.remove(id);
  }
}
