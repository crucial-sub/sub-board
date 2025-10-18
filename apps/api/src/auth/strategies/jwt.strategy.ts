// JWT 액세스 토큰을 검증하는 Passport 전략
import { Injectable } from "@nestjs/common";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

type JwtPayload = {
  sub: string;
  loginId: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>("JWT_ACCESS_SECRET") ?? "test-access-secret";
    // 우선순위를 쿠키로 두고, 없을 때만 Authorization 헤더를 읽는다
    const cookieExtractor = (request: Request) => request?.cookies?.sb_access_token || null;
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor, ExtractJwt.fromAuthHeaderAsBearerToken()]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload) {
    // Passport는 반환된 객체를 request.user에 주입한다
    return { userId: payload.sub, loginId: payload.loginId };
  }
}
