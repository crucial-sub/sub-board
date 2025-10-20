// JWT 인증이 필요한 라우트를 보호하는 가드
import { Injectable } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
	canActivate(context: ExecutionContext) {
		return super.canActivate(context);
	}
}
