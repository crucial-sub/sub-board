// 게시글 CRUD HTTP 엔드포인트를 제공하는 컨트롤러
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PostsService } from "./posts.service";

@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreatePostDto, @CurrentUser() user: { userId: string }) {
    return this.postsService.create(user.userId, dto);
  }

  @Get()
  findAll(@Query("page") page?: string, @Query("pageSize") pageSize?: string, @Query("keyword") keyword?: string) {
    return this.postsService.findAll(Number(page ?? "1"), Number(pageSize ?? "10"), keyword?.trim() || undefined);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdatePostDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.postsService.update(id, user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: { userId: string }) {
    return this.postsService.remove(id, user.userId);
  }
}
