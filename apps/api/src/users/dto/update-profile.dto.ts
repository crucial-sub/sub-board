// 사용자 프로필 수정 요청 DTO
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateProfileDto {
	@IsOptional()
	@IsString({ message: "닉네임은 문자열이어야 합니다." })
	@MinLength(2, { message: "닉네임은 최소 2자 이상이어야 합니다." })
	@MaxLength(20, { message: "닉네임은 최대 20자까지 가능합니다." })
	nickname?: string;
}

