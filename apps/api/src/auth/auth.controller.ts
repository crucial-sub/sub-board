// 인증 관련 HTTP 엔드포인트를 제공하는 컨트롤러
import { Body, Controller, HttpCode, HttpStatus, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { AuthService, AuthResult } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

type SessionMetadata = {
  userAgent?: string | null;
  ipAddress?: string | null;
};

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto, @Req() request: Request): Promise<AuthResult> {
    return this.authService.register(dto, this.extractSessionMetadata(request));
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto, @Req() request: Request): Promise<AuthResult> {
    return this.authService.login(dto, this.extractSessionMetadata(request));
  }

  private extractSessionMetadata(request: Request): SessionMetadata {
    const forwardedFor = request.headers["x-forwarded-for"];
    const ipAddress = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(",")[0]?.trim() ?? request.ip;

    return {
      userAgent: request.headers["user-agent"] ?? null,
      ipAddress,
    };
  }
}
