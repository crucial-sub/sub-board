# 백엔드 아키텍처 & 구현 상세 설명 (2025-10-20 기준)

> 이 문서는 `apps/api` 프로젝트 전체를 분석하여 **NestJS + Prisma + PostgreSQL** 기반 백엔드가 어떻게 동작하는지, 어떤 설계 철학으로 폴더 구조를 짰는지, 각 파일과 로직의 책임이 무엇인지 상세하게 정리한다. 또한, 왜 NestJS/Prisma/PostgreSQL/Docker를 선택했는지, TypeORM/MySQL과의 비교, 인증(JWT) 흐름, Guard/Decorator/Dtos의 사용법까지 하나하나 설명한다.

---

## 0. 기술 스택 개요와 선택 이유

| 기술 | 용도/특징 | 이 프로젝트에서의 활용 및 장점 |
|------|-----------|--------------------------------|
| **NestJS** | Node.js 위에 구축된 서버 프레임워크. 모듈/DI/데코레이터 기반 아키텍처로 Angular에서 영감을 받음. | 프로젝트 구조를 모듈(Module) 단위로 분리, Controller-Service-DI 패턴을 통해 코드 가독성 및 테스트 용이성 확보. |
| **Node.js (런타임)** | JavaScript/TypeScript 백엔드 실행 환경 | NestJS는 Node.js 위에서 실행, 이벤트 기반 비동기 처리 및 풍부한 npm 에코시스템 활용 |
| **Prisma** | Type-safe ORM(ORM + query builder) | TypeORM 대비 더 직관적인 schema-first 접근, auto-completion, 마이그레이션 관리, NestJS와 쉽게 통합 |
| **PostgreSQL** | 관계형 DBMS, JSON/Binary, 복잡한 쿼리 지원 | 스키마 기반 구조 정의와 JSON 타입, 관계형 기능이 강력 → Prisma와 궁합, 태그/관계 처리에 유리 |
| **Docker Compose** | 컨테이너 오케스트레이션 | 개발환경에서 PostgreSQL을 손쉽게 실행/관리. `docker-compose.yml`로 DB 컨테이너, 볼륨 관리 |
| **argon2** | 비밀번호 해시 | bcrypt보다 최신 알고리즘, 안전성 ↑ |
| **@nestjs/jwt / passport-jwt** | JWT 인증 | 액세스/리프레시 토큰 발급, Guard를 통한 인증 보호 |
| **class-validator / class-transformer** | 요청 DTO 검증 | Controller에서 DTO를 적용하면 ValidationPipe가 자동 검증 |

---

## 1. NestJS 기본 철학과 구조

### 1.1 Module, Controller, Service

- **Module** (`*.module.ts`)  
  - NestJS에서 관련 기능을 묶는 최상위 단위.  
  - 예: `AuthModule`, `PostsModule`, `CommentsModule`, `PrismaModule` 등.  
  - providers, controllers, imports, exports로 구성되어 의존성 주입(Dependency Injection)을 설정.

- **Controller** (`*.controller.ts`)  
  - HTTP 엔드포인트를 정의.  
  - 요청을 받고, DTO를 검증하며, Service를 호출하여 비즈니스 로직 수행 후 응답을 반환.

- **Service** (`*.service.ts`)  
  - 실제 비즈니스 로직, DB 연동, 도메인 규칙을 구현.  
  - Controller에서는 복잡한 로직 없이 Service에 위임.

NestJS의 흐름: **요청 → Controller (DTO/Guard/Decorator) → Service → Prisma 등 의존성 → 응답**

### 1.2 Decorator와 DI

- `@Controller`, `@Get`, `@Post`, `@Body`, `@Query`, `@Param`, `@UseGuards`, `@Injectable` 등은 데코레이터로, NestJS가 메타데이터를 읽어 라우팅 및 의존성 주입을 자동화한다.
- `constructor(private readonly postsService: PostsService)` : NestJS가 PostsService 인스턴스를 Module에서 찾아 주입.
- Custom Decorator (`@CurrentUser`) → Guard가 요청에 `user`를 넣고, Decorator가 추출.

### 1.3 DTO

- Data Transfer Object. 클래스 기반으로 요청/응답 데이터 형태를 명시.  
- `class-validator` 데코레이터를 이용해 필드 검증 (`@IsString`, `@MinLength`, `@IsArray`, `@ArrayMaxSize` 등).  
- ValidationPipe가 Controller에서 DTO를 적용하면 클래스 인스턴스로 변환 후 자동 검증 → 실패 시 400 에러와 메시지 반환.

### 1.4 Guard

- Guard는 Controller/Route 앞에서 요청을 가로채 인증/권한 여부를 판단.  
- `JwtAuthGuard` → `@UseGuards(JwtAuthGuard)`로 붙은 엔드포인트는 JWT 인증이 필수.

---

## 2. 프로젝트 구조 (`apps/api/src`)

```
├─ app.module.ts         # 루트 모듈
├─ auth/                 # 인증 모듈 (로그인/회원가입/토큰/Guard)
├─ comments/             # 댓글 CRUD
├─ posts/                # 게시글 CRUD + 태그 처리
├─ prisma/               # Prisma 서비스 및 모듈
├─ users/                # 사용자 로직
└─ common/               # 데코레이터 등 공통 유틸
```

### 2.1 `app.module.ts`

```ts
@Module({
  imports: [AuthModule, PostsModule, CommentsModule, PrismaModule, UsersModule],
})
export class AppModule {}
```
- 루트 모듈이며, 애플리케이션에 필요한 모든 모듈을 import.  
- NestFactory가 `AppModule` 기반으로 앱을 부팅.

### 2.2 `main.ts`

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001);
}
```

- Nest 앱 초기화. ValidationPipe를 전역으로 세팅 → DTO 검증 자동화.  
- `cookie-parser`로 요청 쿠키 파싱.  
- CORS 설정(`credentials: true`) → 프론트에서 쿠키 인증 가능.  
- `transform: true` → DTO 클래스 인스턴스로 변환 (string Query를 number로 캐스팅 가능).

---

## 3. Prisma & Database

### 3.1 Prisma란?
- `schema.prisma`로 데이터 모델을 정의 → Prisma Client 자동 생성.  
- Type-safe 쿼리: IDE 자동 완성과 컴파일타임 타입 검증.  
- 마이그레이션 관리, `prisma db push`로 스키마 → DB 동기화 가능.
- TypeORM은 데코레이터 기반 entity-class 정의, 런타임 메타데이터로 스키마 유추. Prisma는 schema-first로 명시적.

### 3.2 `schema.prisma` 주요 모델

```prisma
model User {
  id           String @id @default(cuid())
  loginId      String @unique
  nickname     String @unique
  passwordHash String
  sessions     Session[]
  posts        Post[]
  comments     Comment[]
}

model Post {
  id        String @id @default(cuid())
  authorId  String
  title     String
  content   String
  viewCount Int    @default(0)
  tags      Tag[]
  author    User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments  Comment[]
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  posts Post[]
}
```

- 태그와 게시글은 다대다 관계. Prisma는 중간 테이블을 자동 생성 (`_PostToTag`).  
- `@relation` 데코레이터로 관계 정의, `onDelete: Cascade`로 사용자/게시글 삭제 시 관련 데이터 자동 삭제.

### 3.3 PrismaService (`prisma/prisma.service.ts`)

```ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL');
    super(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : undefined);
  }

  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); }
}
```

- NestJS에서 Prisma Client를 단일 인스턴스로 주입하기 위한 서비스.  
- `ConfigService`로 `.env`의 `DATABASE_URL` 읽어 연결(자격 정보 숨김).  
- Nest 라이프사이클에 맞춰 connect/disconnect 처리.

### 3.4 왜 PostgreSQL?
- JSONB, 배열, 고급 쿼리 지원.  
- Prisma 기본 예제가 PostgreSQL 기반 → 세팅 용이.  
- 태그 다대다 관계, 캐스팅, DateTime등을 안전하게 사용 가능.
- MySQL은 JSON/CTE 등 기능 제한이 있어 복잡한 쿼리에 불리. PostgreSQL은 풍부한 기능과 커뮤니티 지원이 강하다.

### 3.5 Docker Compose (`infra/docker-compose.yml`)

```yaml
services:
  database:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: sub_board_dev
      POSTGRES_USER: sub_board
      POSTGRES_PASSWORD: change_me
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

- PostgreSQL 컨테이너를 개발 환경에서 쉽고 재현성 있게 실행.  
- 볼륨(`postgres_data`)으로 데이터 지속성 보장 → 컨테이너 재시작해도 데이터 유지.  
- `docker-compose up -d`로 손쉬운 실행.  
- PostgreSQL이 없는 환경에서도 일관된 DB 준비.

---

## 4. 인증(Auth) 모듈

### 4.1 구성

- `auth/auth.module.ts`
  - `imports: [UsersModule, PrismaModule, JwtModule.registerAsync(...)]`
  - `providers: [AuthService, JwtStrategy, JwtRefreshStrategy]` 등.

- `auth.controller.ts`
  - `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` 정의.

- `auth.service.ts`
  - 회원가입/로그인/토큰 발급 로직.

- `dto/login.dto.ts`, `dto/register.dto.ts`
  - DTO + class-validator로 입력 검증.

- `guards/jwt-auth.guard.ts`, `strategies/jwt.strategy.ts`
  - Access Token 검증을 위한 Passport Guard/Strategy.

### 4.2 JWT 흐름 요약

1. **회원가입 (`POST /auth/register`)**
   - DTO 검증 → UsersService 중복 확인 → 비밀번호 argon2 hash → User 생성.  
   - `AuthService.issueTokens()` → Access Token, Refresh Token 발급.  
   - Refresh Token은 Prisma `Session` 테이블에 hash 저장(롤링).  
   - 응답 Body + HttpOnly 쿠키(`sb_access_token`, `sb_refresh_token`) 내려줌.

2. **로그인 (`POST /auth/login`)**
   - loginId/password 검증 → argon2 verify → issueTokens → 쿠키/응답 동일.

3. **토큰 재발급 (`POST /auth/refresh`)**
   - Request 쿠키에서 refresh token 추출.  
   - `AuthService.refreshTokens()`에서 JWT 검증 후 Session 존재/만료 확인.  
   - 새 Access/Refresh Token 발급, 이전 세션 삭제(롤링), 새 세션 저장.  
   - 프론트는 실패 시 Zustand `clearAuth` 처리.

4. **로그아웃 (`POST /auth/logout`)**
   - JWT Guard로 보호.  
   - 요청 유저의 모든 세션 삭제, 쿠키 제거.

### 4.3 Guard / Strategy

- `JwtStrategy extends PassportStrategy(Strategy)`  
  - `jwtFromRequest`: 쿠키 → 헤더 순으로 읽음 (`cookieExtractor`).  
  - Payload `{ sub: userId, loginId }` → request.user에 `{ userId, loginId }` 주입.

- `JwtAuthGuard`  
  - `AuthGuard("jwt")`를 확장.  
  - 401이면 Nest가 예외 처리 → 프론트에서 `ApiClient`의 401 핸들러 실행.

### 4.4 DTO 예시 (`login.dto.ts`)

```ts
export class LoginDto {
  @IsString({ message: "로그인 ID는 문자열이어야 합니다." })
  @MinLength(3, { message: "로그인 ID는 최소 3자 이상이어야 합니다." })
  @MaxLength(20, { message: "로그인 ID는 최대 20자까지 가능합니다." })
  loginId!: string;

  @IsString({ message: "비밀번호는 문자열이어야 합니다." })
  @MinLength(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." })
  @MaxLength(64, { message: "비밀번호는 최대 64자까지 가능합니다." })
  password!: string;
}
```

- ValidationPipe 덕분에 유효성 오류 시 자동으로 400 + 메시지 반환 → 프론트가 그대로 표시.

---

## 5. 사용자(User) 모듈

- `users/users.service.ts`
  - Prisma Client로 User 테이블 조회/생성/수정.  
  - AuthService가 호출하여 로그인/회원가입 시 사용자 정보 확인.
  - `toPublic()` 함수로 비밀번호 제외한 public 데이터 반환 → 보안상 안전.

---

## 6. 게시글(Posts) 모듈

### 6.1 PostsModule 구성
- `posts/posts.module.ts` (파일에는 Providers/Controllers 선언).
- `posts.controller.ts`
  - `@Get("/posts")`, `@Post("/posts")`, `@Patch`, `@Delete` 등 라우트 정의.  
  - `@UseGuards(JwtAuthGuard)`로 보호된 API는 인증 사용자만 접근.

### 6.2 PostsController 주요 라우트

```ts
@Get("tags")
listTags() {
  return this.postsService.listTags();
}

@Get()
findAll(@Query("page") page, @Query("pageSize") pageSize, @Query("keyword") keyword, @Query("tag") tag) {
  return this.postsService.findAll(...);
}

@UseGuards(JwtAuthGuard)
@Post()
create(@Body() dto: CreatePostDto, @CurrentUser() user) { ... }
```

### 6.3 CreatePostDto (태그 포함)

```ts
export class CreatePostDto {
  @IsString() @MinLength(1) @MaxLength(120) title!: string;
  @IsString() @MinLength(1) content!: string;

  @IsOptional()
  @IsArray() @ArrayMaxSize(10) @ArrayUnique() @IsString({ each: true })
  tags?: string[];
}
```

- 태그는 문자열 배열, 최대 10개, 중복 방지.  
- Normalize 로직은 Service에서 처리(소문자 비교, trim, 해시태그 기호 제거).

### 6.4 PostsService

```ts
async create(authorId, dto) {
  const tagNames = this.normalizeTags(dto.tags);
  return prisma.post.create({
    data: {
      authorId,
      title: dto.title,
      content: dto.content,
      tags: tagNames.length ? {
        connectOrCreate: tagNames.map((name) => ({ where: { name }, create: { name } })),
      } : undefined,
    },
    include: { author: { select: ... }, tags: { select: { name: true } } },
  });
}
```

- `normalizeTags`  
  - `#` 제거, trim, 소문자 중복 제거, 길이 제한.
- `connectOrCreate`  
  - 기존 태그 있으면 연결, 없으면 생성 → Race Condition 방지.

```ts
async findAll(page, pageSize, keyword?, tag?) {
  const filters: Prisma.PostWhereInput[] = [];
  if (keyword) filters.push({ OR: [ ...title/content/nickname contains...] });
  if (tag) filters.push({ tags: { some: { name: tag } } });
  const where = filters.length ? { AND: filters } : undefined;

  const [items, total] = await this.prisma.$transaction([
    this.prisma.post.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      where,
      select: { id, title, content, viewCount, createdAt, updatedAt, author, tags },
    }),
    this.prisma.post.count({ where }),
  ]);
  return { items, total, page, pageSize };
}
```

- Prisma `$transaction`으로 findMany/count 동시 수행.  
- `contains` + `QueryMode.insensitive` → 대소문자 구분 없이 검색.  
- 태그 필터는 `some` 조건으로 다대다 관계 처리.

```ts
async listTags() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });
  return tags.map(tag => ({ id: tag.id, name: tag.name, count: tag._count.posts }));
}
```

- 태그 목록 + 게시글 수 → 프론트에서 필터 UI에 사용.

```ts
async update(id, authorId, dto) {
  await ensureOwnership(id, authorId); // 작성자 검증
  const tagNames = dto.tags !== undefined ? normalizeTags(dto.tags) : undefined;
  return prisma.post.update({
    where: { id },
    data: {
      title: dto.title,
      content: dto.content,
      tags: tagNames !== undefined
        ? { set: [], connectOrCreate: ... } // 기존 태그 제거 후 새로 연결
        : undefined,
    },
    select: { id, title, content, viewCount, createdAt, updatedAt, tags: { select: { name: true } } },
  });
}
```

- 태그를 재설정할 때는 `set: []`로 기존 관계 제거 후 다시 연결.

```ts
async ensureOwnership(id, authorId) {
  const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
  if (!post) throw new NotFoundException(...);
  if (post.authorId !== authorId) throw new ForbiddenException(...);
}
```

### 6.5 CommentsService

- `create(authorId, dto)`  
  - 댓글 작성 시 해당 post/user 존재 여부 확인.  
  - `select`로 댓글 + 작성자 정보 반환 → 프론트에서 즉시 UI 반영.

- `remove(commentId, authorId)`  
  - 본인 댓글인지 확인 후 삭제.

Guard는 Posts와 동일하게 `JwtAuthGuard`.

---

## 7. 기타 공통 요소

### 7.1 Common Decorator (`common/decorators/current-user.decorator.ts`)

```ts
export const CurrentUser = createParamDecorator((_data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
```

- Guard에서 `request.user`에 주입한 값을 Controller handler에서 파라미터로 쉽게 받도록 해준다.

### 7.2 PrismaModule (`prisma/prisma.module.ts`)

```ts
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- PrismaService를 모든 모듈에서 주입받을 수 있도록 export.

### 7.3 Seeds (`scripts/seed-demo.ts`)

- 개발용 더미 데이터 자동 생성.  
- 기존 데이터 `deleteMany()`로 비우고, 사용자/게시글/댓글/태그를 생성.  
- argon2 hash로 비밀번호 일치(테스트용 `Password123!`).

---

## 8. TypeORM vs Prisma, PostgreSQL vs MySQL 요약

| 비교 | Prisma | TypeORM |
|------|--------|---------|
| 모델 정의 | `schema.prisma` 파일 (schema-first) | 엔티티 클래스 데코레이터 |
| 타입 안정성 | 자동 생성된 Prisma Client (TS) | TS 타입 지원 있지만 런타임 검사 필요 |
| 마이그레이션 | `prisma migrate` (schema diff) | `typeorm migration` (카멜케이스) |
| 쿼리 스타일 | 체이닝/메소드 (선언적) | Query builder/Repo (명령적) |
| 프로젝트 적용 | 빠른 개발, 명시적 스키마 → 팀 공유 용이 | 데코레이터 기반이지만 설정 복잡 |

| DB 비교 | PostgreSQL | MySQL |
|---------|------------|-------|
| JSON, 배열 | 지원 (JSONB, Array) | JSON 지원하지만 기능 제한 |
| 트랜잭션/CTE | 강력, 복잡한 쿼리에 유리 | CTE, 윈도우 함수 제한적 |
| 확장성 | 확장 가능, GIS, Fulltext도 존재 | 기본 기능은 충분하지만 복잡한 구조에 제약 |
| 프로젝트 적합성 | 태그/검색/관계 처리에 유리, Prisma 기본 예제도 PostgreSQL | 가능하지만 추가 설정 필요 |

---

## 9. 인증/보안 고려사항

- 비밀번호 argon2 hash 저장.  
- JWT는 Access Token 15분, Refresh Token 14일 등 `.env`에 설정.  
- Refresh Token은 Session 테이블에 hash 저장 → 훔쳐도 그대로 사용 불가.  
- `HttpOnly` 쿠키로 클라이언트 JS에서 접근 불가능 → XSS 안전성 증가.  
- CORS 설정에서 `credentials: true`로 쿠키 허용, `origin` 지정으로 CSRF 제한.

---

## 10. 서버와 프론트 연결

- 프론트 엔드에서 `NEXT_PUBLIC_API_BASE_URL` 환경 변수를 사용 → API 엔드포인트 주소 결합.  
- React Query를 통해 `/posts`, `/auth/*`, `/comments` 호출.  
- `ApiClient`가 401 → 전역 상태 초기화 → UI가 즉시 로그아웃 반영.

---

## 11. 작업 흐름 정리

1. **NestJS** 구조 → Module → Controller → Service → Prisma → DB 순으로 요청 흐름.  
2. **PrismaService**로 모든 Service가 Prisma Client 공유.  
3. **DTO + ValidationPipe**로 입력 검증.  
4. **Guard + Decorator**로 인증 처리.  
5. **Argon2**로 비밀번호 hash/verify.  
6. **JWT**로 세션, Refresh Token은 DB에 저장하며 롤링 전략.  
7. **태그 기능** → 다대다 관계, `connectOrCreate`, `listTags`, 프론트 filter/표시.  
8. **Docker + PostgreSQL** → 로컬 개발 DB, Prisma migrate/reset 쉽게.

---

## 12. 향후 개선 아이디어

- **클린 아키텍처 강화**: DTO ↔ 엔티티 ↔ 응답 변환을 mapper로 분리.  
- **테스트**: E2E 외에 unit/integration 테스트 확대.  
- **Access Token 갱신 로직**: Guard에서 자동 리프레시 시도 시 재발급 도입 가능.  
- **서버 컴포넌트 전환**(프론트) 시 SSR/SEO 강화, 백엔드 API 일부 -> RPC화.  
- **로깅/모니터링**: Nest Logger, APM, metrics 추가.  
- **Role/Permission Guard**: 현재는 기본 인증만 있으므로 권한 확장 계획 고려.

---

## 13. 요약

- NestJS는 모듈/DI/데코레이터 구조로 대규모 백엔드 개발에 적합하다. Controller(엔드포인트) - Service(비즈니스 로직) - Prisma(데이터 접근)로 책임 분리.  
- Prisma는 schema-first로 모델을 선언하고 타입 안전한 Client를 제공, PostgreSQL의 고급 기능을 쉽게 활용.  
- Docker Compose로 개발 DB를 빠르게 띄우며, `.env`로 연결 설정을 관리한다.  
- 인증은 JWT + Refresh Token + Session 테이블로 안전하게 구현.  
- Posts/Comments 도메인은 태그 다대다 관계를 포함하여 Prisma의 `connectOrCreate`, `transaction`을 활용.  
- 전체 구조와 흐름을 이해하면 새로운 기능 (예: 북마크, 알림)도 동일한 패턴(Module → Controller → Service → Prisma → DTO → Guard)으로 손쉽게 확장할 수 있다.

---

궁금한 부분이나 더 깊게 알고 싶은 파일이 있다면, 이 문서를 기반으로 해당 경로의 실제 코드를 열어 확인하면 이해가 훨씬 빠를 것이다. 언제든지 질문해 줘! 💪
