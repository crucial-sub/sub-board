import { Controller, MessageEvent, Sse, UseGuards } from "@nestjs/common";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { NotificationsService } from "./notifications.service";
import type { NotificationEvent } from "./notifications.types";

@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationsController {
	constructor(private readonly notificationsService: NotificationsService) {}

	@Sse("stream")
	stream(@CurrentUser() user: { userId: string }): Observable<MessageEvent> {
		return this.notificationsService.register(user.userId).pipe(
			map(
				(event: NotificationEvent): MessageEvent => ({
					data: event,
				}),
			),
		);
	}
}
