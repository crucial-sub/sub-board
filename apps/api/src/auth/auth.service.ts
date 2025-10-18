// 인증 흐름을 담당하는 서비스
import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { PublicUser, UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

type SessionMetadata = {
  userAgent?: string | null;
  ipAddress?: string | null;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
};

export type AuthResult = {
  user: PublicUser;
  tokens: AuthTokens;
};

@Injectable()
export class AuthService {
  private readonly accessTokenTtl: number;
  private readonly refreshTokenTtl: number;
  private readonly refreshSecret: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenTtl = Number(this.configService.get<string>("JWT_ACCESS_EXPIRES_IN") ?? "900");
    this.refreshTokenTtl = Number(this.configService.get<string>("JWT_REFRESH_EXPIRES_IN") ?? "1209600");
    this.refreshSecret = this.configService.get<string>("JWT_REFRESH_SECRET") ?? "refresh_secret";
  }

  async register(dto: RegisterDto, metadata: SessionMetadata): Promise<AuthResult> {
    const { loginId, nickname, password } = dto;

    const existingByLoginId = await this.usersService.findByLoginId(loginId);
    if (existingByLoginId) {
      throw new ConflictException("이미 사용 중인 로그인 ID입니다.");
    }

    const existingByNickname = await this.usersService.findByNickname(nickname);
    if (existingByNickname) {
      throw new ConflictException("이미 사용 중인 닉네임입니다.");
    }

    const passwordHash = await argon2.hash(password);
    const user = await this.usersService.createUser({ loginId, nickname, passwordHash });

    const tokens = await this.issueTokens(user, metadata);
    return { user, tokens };
  }

  async login(dto: LoginDto, metadata: SessionMetadata): Promise<AuthResult> {
    const { loginId, password } = dto;
    const user = await this.usersService.findByLoginId(loginId);

    if (!user) {
      throw new UnauthorizedException("로그인 ID 또는 비밀번호를 확인하세요.");
    }

    const isValid = await argon2.verify(user.passwordHash, password);
    if (!isValid) {
      throw new UnauthorizedException("로그인 ID 또는 비밀번호를 확인하세요.");
    }

    const publicUser = this.usersService["toPublic"](user);
    const tokens = await this.issueTokens(publicUser, metadata);
    return { user: publicUser, tokens };
  }

  async refreshTokens(refreshToken: string, metadata: SessionMetadata): Promise<AuthResult> {
    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.refreshSecret,
      });
    } catch (error) {
      throw new UnauthorizedException("리프레시 토큰이 유효하지 않습니다.");
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException("사용자를 찾을 수 없습니다.");
    }

    const session = await this.findMatchingSession(payload.sub, refreshToken);
    if (!session || session.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException("리프레시 토큰이 만료되었거나 유효하지 않습니다.");
    }

    await this.prisma.session.delete({ where: { id: session.id } });

    const tokens = await this.issueTokens(user, metadata);
    return { user, tokens };
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  private async findMatchingSession(userId: string, refreshToken: string) {
    const sessions = await this.prisma.session.findMany({ where: { userId } });
    for (const session of sessions) {
      const matches = await argon2.verify(session.refreshToken, refreshToken).catch(() => false);
      if (matches) {
        return session;
      }
    }
    return null;
  }

  private async issueTokens(user: PublicUser, metadata: SessionMetadata): Promise<AuthTokens> {
    const payload = { sub: user.id, loginId: user.loginId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: this.accessTokenTtl }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.refreshTokenTtl,
        secret: this.refreshSecret,
      }),
    ]);

    const expiresAt = new Date(Date.now() + this.refreshTokenTtl * 1000);
    const hashedRefreshToken = await argon2.hash(refreshToken);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: hashedRefreshToken,
        userAgent: metadata.userAgent ?? null,
        ipAddress: metadata.ipAddress ?? null,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: this.accessTokenTtl,
      refreshTokenExpiresIn: this.refreshTokenTtl,
    };
  }
}
