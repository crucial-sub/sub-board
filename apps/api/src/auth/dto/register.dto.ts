// 회원가입 요청에서 수집해야 할 필수 필드 정의
import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
	@IsString({ message: "로그인 ID는 문자열이어야 합니다." })
	@MinLength(4, { message: "로그인 ID는 최소 4자 이상이어야 합니다." })
	@MaxLength(20, { message: "로그인 ID는 최대 20자까지 가능합니다." })
	@Matches(/^[a-zA-Z0-9_-]+$/, {
		message: "로그인 ID는 영문, 숫자, -, _ 문자만 사용할 수 있습니다.",
	})
	loginId!: string;

	@IsString({ message: "닉네임은 문자열이어야 합니다." })
	@MinLength(2, { message: "닉네임은 최소 2자 이상이어야 합니다." })
	@MaxLength(20, { message: "닉네임은 최대 20자까지 가능합니다." })
	nickname!: string;

	@IsString({ message: "비밀번호는 문자열이어야 합니다." })
	@MinLength(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." })
	@MaxLength(64, { message: "비밀번호는 최대 64자까지 가능합니다." })
	password!: string;
}
