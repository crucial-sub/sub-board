# Backend Auth Plan

## 목표
- Prisma `User` 모델을 기반으로 회원가입/로그인, 인증 토큰 발급을 지원하는 NestJS 모듈 구성
- 비밀번호 해시/검증, JWT 발급/갱신, 인증 가드와 같이 인증 파이프라인 전반을 설계
- 서비스와 컨트롤러를 도메인 별로 분리하고, 테스트 전략과 마이그레이션 분할 계획 수립

## 모듈 구조
- `UsersModule`
  - `UsersService`: Prisma를 통해 사용자 CRUD 수행 (이미 생성한 서비스 사용)
  - 향후 `UsersController`에서 사용자 프로필 조회/수정 엔드포인트 노출 예정
- `AuthModule`
  - `AuthService`: 회원가입, 로그인, 토큰 발급/갱신 로직 담당
  - `AuthController`: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`
  - `JwtStrategy`, `JwtAuthGuard`: `@nestjs/passport` + JWT 기반 인증
  - 비밀번호 해시 라이브러리로 `argon2` 선택 예정 (`argon2` + `@node-rs/argon2` 대안 검토)
- `SessionModule`(선택): 리프레시 토큰 또는 세션 테이블 관리 시 별도 모듈로 분리

## 데이터 모델링
Prisma `User` 모델을 확장하고, 인증 관련 상태를 저장하는 추가 모델 정의 예정.

```prisma
model User {
  id           String   @id @default(cuid())
  loginId      String   @unique
  nickname     String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  sessions     Session[]
}

model Session {
  id             String   @id @default(cuid())
  userId         String
  refreshToken   String   @unique
  userAgent      String?
  ipAddress      String?
  expiresAt      DateTime
  createdAt      DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

- Session 모델은 선택 사항이지만, 로컬 개발 시에도 안전하게 로그아웃/토큰 폐기가 가능하도록 도입 권장
- 리프레시 토큰을 DB에 저장하고, 재발급 시 롤링(갱신) 전략 사용

## DTO & Response 설계
- `RegisterDto`: `loginId`, `nickname`, `password`
- `LoginDto`: `loginId`, `password`
- `AuthTokens`: `{ accessToken: string; refreshToken: string; accessTokenExpiresIn: number; refreshTokenExpiresIn: number; }`
- `AuthPayload`: JWT payload는 최소 `{ sub: userId, loginId }`, 추후 권한 정보 추가 가능
- 전역 ValidationPipe에 `whitelist: true`, `forbidNonWhitelisted: true` 옵션 적용 예정

## 서비스 로직 흐름
1. **회원가입**
- `UsersService.findByLoginId()`로 중복 체크 → 존재하면 `ConflictException`
   - `argon2.hash()`로 비밀번호 해시 후 `UsersService.createUser()` 호출
   - 세션 레코드 생성 + JWT/리프레시 토큰 발급 후 반환
2. **로그인**
- `UsersService.findByLoginId()` → 없으면 `UnauthorizedException`
   - `argon2.verify()`로 비밀번호 검증 → 실패 시 `UnauthorizedException`
   - 기존 세션 무효화(선택) 후 새로운 세션/토큰 발급
3. **토큰 갱신**
   - 리프레시 토큰 유효성 검사, 세션 테이블 확인, 만료 여부 검증
   - 새 Access Token + Refresh Token 발급, 기존 리프레시 토큰 폐기(롤링)
4. **로그아웃**
   - 세션 삭제 또는 refresh token 폐기

## JWT 설정
- `@nestjs/jwt` 모듈 사용, Access Token 만료 15분, Refresh Token 만료 14일 등 정책 결정
- 시크릿은 `.env`에 `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` 분리 저장
- `JwtModule.registerAsync`로 ConfigService 연동

## 예외 처리 및 가드
- Nest `HttpException` 계층 사용 (`ConflictException`, `UnauthorizedException` 등)
- `JwtAuthGuard`는 Passport 전략으로 구현, `Request`에 `user` 객체 주입
- `RolesGuard`는 추후 권한 관리 필요 시 확장

## 테스트 전략
- `UsersService`: Prisma Test Client + 테스트 DB (전용 schema) → `db:test:prepare` 스크립트 고려
- `AuthService`: 비밀번호 해시/토큰 발급을 Mocking하면서 단위 테스트 진행
- e2e 테스트: `supertest`로 `/auth/register`, `/auth/login` 흐름 검증, test schema에 대해 migrate

## 마이그레이션 계획
1. `Session` 모델을 Prisma schema에 추가 (완료)
2. 개발 DB를 `prisma migrate reset --schema apps/api/prisma/schema.prisma`로 초기화한 뒤, `prisma migrate dev --schema apps/api/prisma/schema.prisma --name init`으로 첫 마이그레이션을 생성
3. 이후 User 속성 확장(예: `role`, `avatarUrl`)마다 별도 마이그레이션 생성
4. 테스트 환경 분리를 위해 `.env.test`에서 `DATABASE_URL`을 test DB로 지정 → GitHub Actions 등 CI에서 `prisma migrate deploy`

## 다음 작업 순서 제안
1. `Session` 모델 추가 및 `db:migrate dev` 실행 → 테스트 스키마 정리
2. `UsersModule`, `AuthModule` 구현
   - DTO에 `class-validator` 적용 (`IsString`, `MinLength`, 등)
   - `argon2`, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt` 설치
3. 글로벌 ValidationPipe & 예외 필터 설정 (main.ts 업데이트)
4. 토큰 발급/갱신/로그아웃 API 구현 및 e2e 테스트 작성
5. 프론트엔드와 연동 (React Query mutation + Zustand 세션 스토어)
