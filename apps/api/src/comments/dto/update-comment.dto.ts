// 댓글 수정 요청 DTO
import { IsString, MinLength } from "class-validator";

export class UpdateCommentDto {
	@IsString({ message: "내용은 문자열이어야 합니다." })
	@MinLength(1, { message: "내용은 최소 1자 이상이어야 합니다." })
	content!: string;
}

