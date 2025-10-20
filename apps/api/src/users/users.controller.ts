// 사용자 관련 HTTP 엔드포인트를 제공하는 컨트롤러
import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UsersService } from "./users.service";

@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get("me/stats")
	getMyStats(@CurrentUser() user: { userId: string }) {
		return this.usersService.getUserStats(user.userId);
	}
}
