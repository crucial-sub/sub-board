// 인증 관련 HTTP 엔드포인트를 제공하는 컨트롤러
import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Get,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseGuards,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService, AuthResult, AuthTokens } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { RegisterDto } from "./dto/register.dto";
import { ConfigService } from "@nestjs/config";

type SessionMetadata = {
	userAgent?: string | null;
	ipAddress?: string | null;
};

@Controller("auth")
export class AuthController {
	private readonly isProduction: boolean;

	constructor(
		private readonly authService: AuthService,
		private readonly configService: ConfigService,
	) {
		this.isProduction =
			this.configService.get<string>("NODE_ENV") === "production";
	}

	// 회원가입 시 토큰을 쿠키로 내려준다
	@Post("register")
	async register(
		@Body() dto: RegisterDto,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	): Promise<AuthResult> {
		const result = await this.authService.register(
			dto,
			this.extractSessionMetadata(request),
		);
		this.setAuthCookies(response, result.tokens);
		return result;
	}

	// 로그인 시 기존 세션을 정리하고 새 토큰을 쿠키에 설정한다
	@Post("login")
	@HttpCode(HttpStatus.OK)
	async login(
		@Body() dto: LoginDto,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	): Promise<AuthResult> {
		const result = await this.authService.login(
			dto,
			this.extractSessionMetadata(request),
		);
		this.setAuthCookies(response, result.tokens);
		return result;
	}

	// 리프레시 토큰으로 새 액세스토큰을 발급한다
	@Post("refresh")
	@HttpCode(HttpStatus.OK)
	async refresh(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	): Promise<AuthResult> {
		const cookies =
			(request as Request & { cookies?: Record<string, string> }).cookies ?? {};
		const refreshToken = cookies.sb_refresh_token;
		if (!refreshToken) {
			throw new UnauthorizedException("리프레시 토큰이 없습니다.");
		}
		const result = await this.authService.refreshTokens(
			refreshToken,
			this.extractSessionMetadata(request),
		);
		this.setAuthCookies(response, result.tokens);
		return result;
	}

	// 모든 세션을 삭제하고 인증 쿠키를 지운다
	@Post("logout")
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	async logout(
		@CurrentUser() user: { userId: string },
		@Res({ passthrough: true }) response: Response,
	) {
		await this.authService.logout(user.userId);
		this.clearAuthCookies(response);
		return { success: true };
	}

	// 액세스 토큰으로 현재 로그인한 사용자를 조회한다
	@Get("profile")
	@UseGuards(JwtAuthGuard)
	async profile(@CurrentUser() user: { userId: string }) {
		const profile = await this.authService.getProfile(user.userId);
		return { user: profile };
	}

	private setAuthCookies(response: Response, tokens: AuthTokens) {
		const cookieOptions = {
			httpOnly: true,
			sameSite: "lax" as const,
			secure: this.isProduction,
			path: "/",
		};

		response.cookie("sb_access_token", tokens.accessToken, {
			...cookieOptions,
			maxAge: tokens.accessTokenExpiresIn * 1000,
		});
		response.cookie("sb_refresh_token", tokens.refreshToken, {
			...cookieOptions,
			maxAge: tokens.refreshTokenExpiresIn * 1000,
		});
	}

	private clearAuthCookies(response: Response) {
		response.clearCookie("sb_access_token", { path: "/" });
		response.clearCookie("sb_refresh_token", { path: "/" });
	}

	private extractSessionMetadata(request: Request): SessionMetadata {
		const forwardedFor = request.headers["x-forwarded-for"];
		const ipAddress = Array.isArray(forwardedFor)
			? forwardedFor[0]
			: (forwardedFor?.split(",")[0]?.trim() ?? request.ip);

		return {
			userAgent: request.headers["user-agent"] ?? null,
			ipAddress,
		};
	}
}
