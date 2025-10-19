// 게시글 생성 요청 DTO
import { ArrayMaxSize, ArrayUnique, IsArray, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreatePostDto {
  @IsString({ message: "제목은 문자열이어야 합니다." })
  @MinLength(1, { message: "제목은 최소 1자 이상이어야 합니다." })
  @MaxLength(120, { message: "제목은 최대 120자까지 가능합니다." })
  title!: string;

  @IsString({ message: "내용은 문자열이어야 합니다." })
  @MinLength(1, { message: "내용은 최소 1자 이상이어야 합니다." })
  content!: string;

  @IsOptional()
  @IsArray({ message: "태그는 문자열 배열이어야 합니다." })
  @ArrayMaxSize(10, { message: "태그는 최대 10개까지 지정할 수 있습니다." })
  @ArrayUnique({ message: "태그는 중복될 수 없습니다." })
  @IsString({ each: true, message: "모든 태그는 문자열이어야 합니다." })
  tags?: string[];
}
