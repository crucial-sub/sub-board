// 댓글 생성 요청 DTO
import { IsString, MinLength } from "class-validator";

export class CreateCommentDto {
	@IsString({ message: "게시글 ID는 문자열이어야 합니다." })
	postId!: string;

	@IsString({ message: "내용은 문자열이어야 합니다." })
	@MinLength(1, { message: "내용은 최소 1자 이상이어야 합니다." })
	content!: string;
}
