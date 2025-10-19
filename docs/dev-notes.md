# 개발 노트 (2025-10-18)

## 백엔드 인증 흐름 요약
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
  posts        Post[]
  comments     Comment[]
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

model Post {
  id        String   @id @default(cuid())
  authorId  String
  title     String
  content   String
  viewCount Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author   User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments Comment[]
}

model Comment {
  id        String   @id @default(cuid())
  postId    String
  authorId  String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)
}
```

- Session 모델은 선택 사항이지만, 로컬 개발 시에도 안전하게 로그아웃/토큰 폐기가 가능하도록 도입 권장
- 리프레시 토큰을 DB에 저장하고, 재발급 시 롤링(갱신) 전략 사용
- Post/Comment 모델은 게시판 CRUD의 토대를 마련하며, User와의 관계를 통해 작성자 정보를 추적한다.

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
1. `Session` 모델 추가 및 `db:migrate dev` 실행 → 테스트 스키마 정리 (완료)
2. `UsersModule`, `AuthModule` 구현 (완료)
   - DTO에 `class-validator` 적용 (`IsString`, `MinLength`, 등) (완료)
   - `argon2`, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt` 설치 (완료)
3. 글로벌 ValidationPipe & 예외 필터 설정 (main.ts 업데이트) (완료)
4. 토큰 발급/갱신/로그아웃 API 구현 및 e2e 테스트 작성 (진행 중: 로그인/회원가입 완료)
5. `Post`, `Comment` 모델 기반으로 게시판 CRUD API 구현 (진행 중: JWT 인증 연동 완료)
6. 댓글/게시글 e2e 테스트 보강 및 문서화 (진행 중)
7. 프론트엔드와 연동 (React Query mutation + Zustand 세션 스토어)


## 프론트엔드 인증 흐름 요약
# 프론트엔드 인증 흐름 정리

## 1. 인증 상태 저장소
- `apps/web/src/features/auth/state/auth-store.ts`
- Zustand 스토어에 `user`, `hasHydrated` 상태를 보관
- 서버에서 받아온 `AuthResponse`로 `setFromResponse`, 로그아웃 시 `clearAuth`

## 2. 초기 세션 동기화
- `UiProvider`에서 `useAuthSession` 훅을 실행
- `GET /auth/refresh` 대신 `POST /auth/refresh` 호출로 액세스/리프레시 쿠키 재발급 시도
- 성공 시 사용자 정보 저장, 실패 시 `clearAuth` 후 `hasHydrated` 플래그 설정

## 3. 로그인/회원가입 흐름
- `useLoginMutation`, `useRegisterMutation`
  - `POST /auth/login` 및 `/auth/register`
  - onSuccess 시 `setFromResponse` → `router.push('/posts')`
  - 에러는 컴포넌트 단에서 표시

## 4. 로그아웃 흐름
- `useLogoutMutation`
  - `POST /auth/logout` 이후 Zustand `clearAuth()` 호출
  - 헤더에서 닉네임 표시 및 로그아웃 버튼 노출

## 5. 보호 라우트
- `useAuthGuard`
  - `hasHydrated` 완료 후 `user`가 없으면 `router.replace('/login')`
  - `/posts/new` 등 보호 페이지에서 사용

## 6. 댓글/게시글 작성 폼
- 작성 폼에서 로그인 여부 체크→ 비로그인 시 안내 메시지 출력
- `useCreatePost`, `useCreateComment`는 성공 시 Query 무효화 및 페이지 전환

## 7. Next.js 라우팅
- `/posts` 목록과 `/search` 페이지에서 React Query `keyword` 파라미터와 호환되도록 훅 수정
- `/posts/[id]` 상세 페이지는 `PostDetail` 컴포넌트에서 댓글 목록과 작성 폼 렌더링

## 8. 다음 확장 아이디어
- 댓글/게시글 작성 시 낙관적 업데이트 적용
- 글 상세 페이지에서 작성자에게만 수정/삭제 버튼 노출
- refresh 실패 시 자동 로그인 페이지 이동

(2025-10-18 기준 최신 프론트 코드를 반영한 흐름)

## 프론트엔드 API 클라이언트 개선
- `apps/web/src/lib/api-client.ts`에서 `ApiError` 클래스를 도입해 HTTP 상태 코드와 응답 본문을 함께 전파한다.
- 401 응답이 들어오면 `useAuthStore`의 `clearAuth`, `markHydrated`를 호출해 세션 상태를 즉시 초기화한다.
- 게시글/댓글 작성 폼은 서버에서 내려온 에러 메시지를 그대로 표시해 사용자에게 원인을 안내한다.
- 댓글 작성 API 경로를 `/comments`로 통일해 백엔드 엔드포인트와 어긋나던 문제를 해결했다.
- 댓글 상세 화면에서는 댓글 작성자가 자신의 댓글을 삭제할 수 있도록 버튼과 뮤테이션(`useDeleteComment`)을 추가했다.
- 전역 헤더는 인증 스토어가 동기화되기 전까지 스켈레톤을 보여주고, 로그인 상태가 결정된 뒤에만 로그아웃/로그인 버튼을 렌더링한다.
- 메인 홈 Hero 섹션은 인증 상태에 따라 CTA를 바꿔 표시하며, hydrates 되기 전에는 추가 버튼을 숨긴다.
- 게시판 페이지에는 빠른 키워드 필터와 "새 글 작성" CTA를 추가했고, 검색 페이지는 전용 결과 리스트와 페이지네이션을 제공하도록 분리했다.
- 홈 화면은 로그인 여부에 따라 Hero 메시지를 분리해, 로그인 사용자는 최신 게시글 / 새 글 작성 CTA를 바로 볼 수 있도록 개선했다.
- 로그인 ID 최소 길이를 3자로 완화해 짧은 계정(`tom`)도 로그인 가능하도록 했다.
- API 클라이언트가 ValidationPipe 오류 배열을 그대로 조합해 표시하도록 개선해 로그인 실패 원인을 바로 확인할 수 있게 했다.
- `/posts` 목록 API에 `keyword` 쿼리를 적용해 제목/본문/작성자 닉네임 기준으로 검색할 수 있도록 수정했다.

## 빌드/테스트 도구 세팅
- `biome.json` 스키마 버전을 2.2.6으로 갱신하고 VCS 연동 클라이언트를 `git`으로 지정해 최신 CLI와 호환되도록 정리했다.
- `pnpm lint` 스크립트는 실제 소스 경로(`apps/api/src`, `apps/web/src`, `packages/shared/src`, `docs`)만 대상으로 실행되도록 조정해 `dist` 산출물에 의해 검사가 중단되지 않도록 했다.
- Biome 설정에서 NestJS의 파라미터 데코레이터를 허용(`javascript.parser.unsafeParameterDecoratorsEnabled`)하고, DI/Tailwind 특성상 부적합한 규칙(`style.useImportType`, `suspicious.noUnknownAtRules`)은 비활성화했다.
- e2e 테스트는 `apps/api/test/comments.e2e-spec.ts`를 추가하고 `jest-e2e.json`의 `maxWorkers`를 1로 고정해 DB 초기화 과정이 서로 간섭하지 않도록 했다.

## 프론트엔드 폼 접근성 보강
- `AuthForm`, 게시글 작성 페이지 등 사용자 입력 폼은 `useId`를 활용해 라벨-입력 요소 사이의 고유 ID를 부여하도록 정리했다.
