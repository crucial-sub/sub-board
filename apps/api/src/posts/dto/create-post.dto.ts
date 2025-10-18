// 게시글 생성 요청 DTO
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreatePostDto {
  @IsString({ message: "제목은 문자열이어야 합니다." })
  @MinLength(1, { message: "제목은 최소 1자 이상이어야 합니다." })
  @MaxLength(120, { message: "제목은 최대 120자까지 가능합니다." })
  title!: string;

  @IsString({ message: "내용은 문자열이어야 합니다." })
  @MinLength(1, { message: "내용은 최소 1자 이상이어야 합니다." })
  content!: string;

  @IsOptional()
  @IsString({ message: "초기 닉네임은 문자열이어야 합니다." })
  nickname?: string;
}
