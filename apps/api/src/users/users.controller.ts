// 사용자 관련 HTTP 엔드포인트를 제공하는 컨트롤러
import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UsersService } from "./users.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get("me/stats")
	getMyStats(@CurrentUser() user: { userId: string }) {
		return this.usersService.getUserStats(user.userId);
	}

	@Patch("me")
	updateMyProfile(
		@Body() dto: UpdateProfileDto,
		@CurrentUser() user: { userId: string },
	) {
		return this.usersService.updateProfile(user.userId, dto);
	}
}
