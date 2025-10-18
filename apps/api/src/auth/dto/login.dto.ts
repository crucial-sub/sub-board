// 로그인 과정에서 필요한 최소 정보 정의
import { IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
  @IsString({ message: "로그인 ID는 문자열이어야 합니다." })
  @MinLength(4, { message: "로그인 ID는 최소 4자 이상이어야 합니다." })
  @MaxLength(20, { message: "로그인 ID는 최대 20자까지 가능합니다." })
  loginId!: string;

  @IsString({ message: "비밀번호는 문자열이어야 합니다." })
  @MinLength(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." })
  @MaxLength(64, { message: "비밀번호는 최대 64자까지 가능합니다." })
  password!: string;
}
