🔐 Frontend Authentication System 완벽 가이드

  📋 목차

  1. #1-전체-아키텍처
  2. #2-인증-흐름
  3. #3-핵심-컴포넌트-상세-분석
  4. #4-ssr과-클라이언트-상태-동기화
  5. #5-보안-고려사항
  6. #6-실전-사용-패턴

  ---
  1. 전체 아키텍처

  1.1 시스템 구성도

  ┌─────────────────────────────────────────────────────────┐
  │                     Browser (Client)                     │
  ├─────────────────────────────────────────────────────────┤
  │                                                           │
  │  ┌─────────────────────────────────────────────────┐   │
  │  │         Zustand Store (auth-store.tsx)          │   │
  │  │  ┌────────────────────────────────────────┐    │   │
  │  │  │  user: User | null                     │    │   │
  │  │  │  hasHydrated: boolean                  │    │   │
  │  │  │  setUser(), clearAuth(), ...           │    │   │
  │  │  └────────────────────────────────────────┘    │   │
  │  └─────────────────────────────────────────────────┘   │
  │                         ↑                                 │
  │                         │ 상태 관리                        │
  │                         │                                 │
  │  ┌─────────────────────┴───────────────────────────┐   │
  │  │           React Components                       │   │
  │  │  ┌──────────────┐  ┌──────────────────────┐   │   │
  │  │  │ useAuthGuard │  │ useAuthMutations     │   │   │
  │  │  │ (페이지 보호) │  │ (로그인/로그아웃)      │   │   │
  │  │  └──────────────┘  └──────────────────────┘   │   │
  │  └─────────────────────────────────────────────────┘   │
  │                         ↓                                 │
  │  ┌─────────────────────────────────────────────────┐   │
  │  │         API Client (api-client.ts)              │   │
  │  │  credentials: 'include' (쿠키 자동 전송)          │   │
  │  │  401 에러 시 자동 clearAuth() 호출                │   │
  │  └─────────────────────────────────────────────────┘   │
  └────────────────────┬────────────────────────────────────┘
                       │ HTTP (쿠키)
                       ↓
  ┌─────────────────────────────────────────────────────────┐
  │              Backend API (NestJS)                        │
  │  /auth/login    - 로그인                                 │
  │  /auth/register - 회원가입                               │
  │  /auth/refresh  - 토큰 갱신                              │
  │  /auth/profile  - 사용자 정보 조회                        │
  │  /auth/logout   - 로그아웃                               │
  └─────────────────────────────────────────────────────────┘

  1.2 핵심 레이어 설명

  | 레이어         | 파일                                   | 역할                         |
  |-------------|--------------------------------------|----------------------------|
  | 상태 관리       | auth-store.tsx                       | Zustand 기반 전역 사용자 상태       |
  | SSR 인증      | get-current-user.ts                  | 서버 사이드에서 쿠키로 사용자 조회        |
  | API 통신      | api-client.ts                        | fetch 래퍼, 쿠키 자동 전송, 401 처리 |
  | React Hooks | useAuthGuard.ts, useAuthMutations.ts | 페이지 보호, 로그인/로그아웃           |
  | Provider    | ui-provider.tsx                      | SSR 사용자 → Zustand 주입       |

  ---
  2. 인증 흐름

  2.1 로그인 흐름 (Login Flow)

  sequenceDiagram
      participant U as User
      participant C as Client Component
      participant A as API Client
      participant B as Backend
      participant Z as Zustand Store

      U->>C: 아이디/비밀번호 입력
      C->>A: login({ loginId, password })
      A->>B: POST /auth/login
      B->>B: 비밀번호 검증 (argon2)
      B->>B: JWT 토큰 생성
      B-->>A: 200 OK + Set-Cookie (쿠키 설정)
      Note right of B: sb_access_token (15분)<br/>sb_refresh_token (14일)
      A-->>C: AuthResponse { user, tokens }
      C->>Z: setFromResponse(response)
      Z->>Z: user 저장, hasHydrated = true
      C->>U: 로그인 성공, 홈으로 이동

  핵심 포인트:
  1. 쿠키는 백엔드가 자동 설정 (Set-Cookie 헤더)
  2. 프론트엔드는 user 정보만 저장 (토큰은 쿠키에만 존재)
  3. credentials: 'include'로 쿠키 자동 전송

  2.2 페이지 로드 시 인증 확인 (SSR Authentication)

  sequenceDiagram
      participant B as Browser
      participant N as Next.js Server
      participant API as Backend API
      participant C as Client Component
      participant Z as Zustand Store

      B->>N: GET /posts (쿠키 포함)
      N->>N: getCurrentUserOnServer()
      N->>API: GET /auth/profile (쿠키 전달)

      alt Access Token 유효
          API-->>N: 200 OK { user }
          N->>N: SSR 렌더링 (user 포함)
          N-->>B: HTML (initialUser 포함)
      else Access Token 만료
          API-->>N: 401 Unauthorized
          N->>API: POST /auth/refresh (refresh token 전달)
          alt Refresh Token 유효
              API-->>N: 200 OK + 새 쿠키 설정
              N->>N: Next.js 쿠키 업데이트
              N->>API: GET /auth/profile (새 토큰)
              API-->>N: 200 OK { user }
              N-->>B: HTML (initialUser 포함)
          else Refresh Token 만료
              N-->>B: HTML (initialUser = null)
          end
      end

      B->>C: React 하이드레이션 시작
      C->>Z: AuthStoreProvider 초기화
      Z->>Z: user = initialUser (SSR 값)
      Z->>Z: hasHydrated = true

  핵심 포인트:
  1. SSR 단계에서 토큰 유효성 검사
  2. 만료 시 자동으로 refresh 시도
  3. SSR 사용자 정보 → Zustand로 주입 (하이드레이션)

  2.3 401 에러 처리 (Token Expiration)

  sequenceDiagram
      participant U as User
      participant C as Component
      participant A as API Client
      participant B as Backend
      participant Z as Zustand Store

      U->>C: 댓글 작성 버튼 클릭
      C->>A: POST /posts/123/comments
      A->>B: POST /posts/123/comments (쿠키)
      B->>B: Access Token 검증
      B-->>A: 401 Unauthorized
      A->>Z: clearAuth() + markHydrated()
      Z->>Z: user = null, hasHydrated = true
      A-->>C: ApiError (401)
      C->>C: useAuthGuard() 감지
      C->>U: 로그인 페이지로 리다이렉트

  핵심 포인트:
  1. API Client가 401을 자동 감지
  2. clearAuth()로 상태 초기화
  3. useAuthGuard()가 자동으로 로그인 페이지로 이동

  ---
  3. 핵심 컴포넌트 상세 분석

  3.1 Zustand Store (auth-store.tsx)

  구조 및 상태

  export type AuthState = {
    user: User | null;              // 현재 로그인한 사용자
    hasHydrated: boolean;           // SSR → 클라이언트 동기화 완료 여부
    setFromResponse: (AuthResponse) => void;  // 로그인 응답 저장
    setUser: (User | null) => void;           // 사용자 직접 설정
    clearAuth: () => void;                    // 로그아웃 (user = null)
    markHydrated: () => void;                 // 하이드레이션 완료 표시
  };

  hasHydrated가 필요한 이유

  문제 상황:
  // ❌ 잘못된 방법
  function MyPage() {
    const user = useAuthStore(state => state.user);

    if (!user) {
      // 문제: SSR에서는 user가 null이고, 클라이언트에서 user가 있을 수 있음
      // → 하이드레이션 mismatch 발생!
      return <div>로그인 필요</div>;
    }

    return <div>환영합니다, {user.nickname}님</div>;
  }

  해결 방법:
  // ✅ 올바른 방법
  function MyPage() {
    const user = useAuthStore(state => state.user);
    const hasHydrated = useAuthStore(state => state.hasHydrated);

    if (!hasHydrated) {
      // 하이드레이션 전에는 아무것도 렌더링하지 않음
      return null;
    }

    if (!user) {
      return <div>로그인 필요</div>;
    }

    return <div>환영합니다, {user.nickname}님</div>;
  }

  Context Pattern 사용 이유

  // ❌ 단순 전역 변수 방식 (문제 있음)
  const authStore = createStore<AuthState>(...);

  // ✅ Context Pattern (권장)
  const AuthStoreContext = createContext<AuthStore | null>(null);

  function AuthStoreProvider({ children, initialState }) {
    const storeRef = useRef<AuthStore>();

    if (!storeRef.current) {
      storeRef.current = createAuthStore(initialState);
    }

    return (
      <AuthStoreContext.Provider value={storeRef.current}>
        {children}
      </AuthStoreContext.Provider>
    );
  }

  장점:
  1. SSR 시 요청마다 독립적인 스토어 (메모리 누수 방지)
  2. 테스트 시 스토어 격리 가능
  3. initialState를 서버에서 주입 가능

  3.2 API Client (api-client.ts)

  쿠키 자동 전송

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      credentials: "include",  // ⭐ 핵심: 쿠키 자동 전송
      ...init,
    });
    // ...
  }

  credentials: 'include'의 역할:
  - 브라우저가 자동으로 쿠키를 HTTP 헤더에 포함
  - sb_access_token, sb_refresh_token 쿠키가 백엔드로 전송됨
  - 프론트엔드는 토큰을 직접 관리하지 않음 (보안 향상)

  401 에러 자동 처리

  if (!response.ok) {
    if (response.status === 401) {
      // ⭐ 인증 만료 시 자동으로 상태 초기화
      const { clearAuth, markHydrated } = getAuthStoreClient().getState();
      clearAuth();
      markHydrated();
    }

    throw new ApiError(response.status, message, data);
  }

  장점:
  - 모든 API 호출에서 자동으로 401 처리
  - 컴포넌트에서 일일이 처리할 필요 없음
  - UX 일관성 유지

  3.3 SSR 인증 (get-current-user.ts)

  Server-Only 모듈

  import "server-only";  // ⭐ 핵심: 클라이언트 번들에서 제외

  의미:
  - 이 파일은 서버에서만 실행됨
  - 클라이언트 번들에 포함되지 않음
  - 민감한 로직을 안전하게 보호

  토큰 갱신 로직

  export async function getCurrentUserOnServer() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb_access_token");
    const refreshToken = cookieStore.get("sb_refresh_token");

    // 1단계: Access Token으로 프로필 조회 시도
    if (accessToken) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: { cookie: cookieStore.toString() },
          credentials: "include",
        });

        if (response.ok) {
          return (await response.json()).user;  // ✅ 성공
        }

        if (response.status !== 401) {
          return null;  // 다른 에러는 무시
        }
        // 401이면 2단계로 진행
      } catch {
        return null;
      }
    }

    // 2단계: Refresh Token으로 토큰 갱신 시도
    if (refreshToken) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { cookie: cookieStore.toString() },
          body: JSON.stringify({}),
        });

        if (response.ok) {
          const data = await response.json();

          // ⭐ 새 토큰을 Next.js 쿠키에 저장
          cookieStore.set("sb_access_token", data.tokens.accessToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: data.tokens.accessTokenExpiresIn,
          });
          cookieStore.set("sb_refresh_token", data.tokens.refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: data.tokens.refreshTokenExpiresIn,
          });

          return data.user;  // ✅ 갱신 성공
        }
      } catch {
        return null;
      }
    }

    return null;  // 모두 실패
  }

  플로우:
  1. Access Token 유효 → 즉시 사용자 반환
  2. Access Token 만료 → Refresh Token으로 갱신 시도
  3. 갱신 성공 → 새 토큰 저장 후 사용자 반환
  4. 갱신 실패 → null 반환 (로그인 필요)

  3.4 useAuthGuard Hook

  export function useAuthGuard() {
    const user = useAuthStore(state => state.user);
    const hasHydrated = useAuthStore(state => state.hasHydrated);
    const router = useRouter();

    useEffect(() => {
      if (!hasHydrated) {
        return;  // ⭐ 하이드레이션 전에는 아무 것도 안함
      }

      if (!user) {
        router.replace("/login");  // 로그인 페이지로 이동
      }
    }, [hasHydrated, router, user]);
  }

  사용 예시:
  function ProtectedPage() {
    useAuthGuard();  // ⭐ 이것만 추가하면 페이지 보호 완료

    return <div>보호된 콘텐츠</div>;
  }

  ---
  4. SSR과 클라이언트 상태 동기화

  4.1 하이드레이션 과정

  1. 서버 (SSR)
     ├─ getCurrentUserOnServer() 실행
     ├─ 쿠키로 사용자 조회
     └─ HTML 생성 (initialUser 포함)
           ↓
  2. 브라우저 (HTML 수신)
     ├─ HTML 파싱 및 표시
     └─ React 하이드레이션 시작
           ↓
  3. React 하이드레이션
     ├─ UiProvider 마운트
     ├─ AuthStoreProvider 초기화
     │    └─ initialState = { user: initialUser, hasHydrated: true }
     └─ Zustand 스토어 생성
           ↓
  4. 컴포넌트 렌더링
     ├─ useAuthStore(state => state.user) 호출
     │    └─ user = initialUser (SSR 값)
     └─ hasHydrated = true

  4.2 레이아웃에서의 통합

  // app/layout.tsx
  import { getCurrentUserOnServer } from "@/features/auth/server/get-current-user";
  import { UiProvider } from "@/providers/ui-provider";

  export default async function RootLayout({ children }) {
    const currentUser = await getCurrentUserOnServer();  // SSR 인증

    return (
      <html>
        <body>
          <UiProvider initialUser={currentUser}>
            {/* ⭐ 모든 페이지가 currentUser에 접근 가능 */}
            {children}
          </UiProvider>
        </body>
      </html>
    );
  }

  ---
  5. 보안 고려사항

  5.1 쿠키 보안 설정

  const COOKIE_OPTIONS = {
    httpOnly: true,       // ⭐ JavaScript로 접근 불가 (XSS 방지)
    sameSite: "lax",     // ⭐ CSRF 공격 방지
    secure: true,        // ⭐ HTTPS에서만 전송
    path: "/",           // 모든 경로에서 사용
  };

  | 옵션            | 설명                     | 보안 효과             |
  |---------------|------------------------|-------------------|
  | httpOnly      | JavaScript로 쿠키 접근 불가   | XSS 공격으로 토큰 탈취 불가 |
  | sameSite: lax | 다른 사이트에서 요청 시 쿠키 전송 제한 | CSRF 공격 방지        |
  | secure: true  | HTTPS에서만 쿠키 전송         | 중간자 공격 방지         |

  5.2 토큰 저장 위치 비교

  | 방식                | XSS 취약성 | CSRF 취약성       | 권장 여부        |
  |-------------------|---------|----------------|--------------|
  | LocalStorage      | ❌ 취약    | ✅ 안전           | ❌ 비권장        |
  | Cookie (httpOnly) | ✅ 안전    | ⚠️ sameSite 필요 | ✅ 권장         |
  | Memory (Zustand)  | ✅ 안전    | ✅ 안전           | ⚠️ 새로고침 시 소실 |

  현재 시스템:
  - 토큰: HttpOnly Cookie (✅ 안전)
  - 사용자 정보: Zustand Memory (✅ 안전, 새로고침 시 SSR로 복구)

  ---
  6. 실전 사용 패턴

  6.1 로그인 컴포넌트

  function LoginForm() {
    const loginMutation = useLoginMutation();

    const handleSubmit = async (e) => {
      e.preventDefault();
      const result = await loginMutation.mutateAsync({
        loginId: "user123",
        password: "password",
      });
      // ⭐ 자동으로 Zustand에 저장됨
      router.push("/");
    };

    return (
      <form onSubmit={handleSubmit}>
        <input name="loginId" />
        <input name="password" type="password" />
        <Button type="submit" isLoading={loginMutation.isPending}>
          로그인
        </Button>
      </form>
    );
  }

  6.2 보호된 페이지

  function ProtectedPage() {
    useAuthGuard();  // ⭐ 이것만 추가하면 페이지 보호

    const user = useAuthStore(state => state.user);

    return <div>환영합니다, {user?.nickname}님</div>;
  }

  6.3 조건부 렌더링

  function Header() {
    const user = useAuthStore(state => state.user);
    const hasHydrated = useAuthStore(state => state.hasHydrated);

    if (!hasHydrated) {
      return null;  // ⭐ 하이드레이션 전에는 렌더링 안함
    }

    return (
      <header>
        {user ? (
          <div>
            <span>{user.nickname}</span>
            <LogoutButton />
          </div>
        ) : (
          <Link href="/login">로그인</Link>
        )}
      </header>
    );
  }

  ---
  🎓 핵심 개념 요약

  ✅ 반드시 기억할 5가지

  1. 쿠키는 백엔드가 관리, 프론트엔드는 사용자 정보만 저장
  2. SSR에서 토큰 갱신, 클라이언트는 이미 갱신된 상태로 시작
  3. hasHydrated로 SSR/클라이언트 불일치 방지
  4. credentials: 'include'로 쿠키 자동 전송
  5. 401 에러 시 자동 clearAuth(), 모든 API 호출에 적용

  🔄 전체 흐름 한눈에 보기

  [로그인]
  사용자 → 폼 제출 → API Client → 백엔드 → 쿠키 설정
                                        ↓
                             Zustand에 user 저장
                                        ↓
                              홈페이지로 리다이렉트

  [페이지 로드]
  브라우저 → Next.js SSR → getCurrentUserOnServer()
                                ↓
                      쿠키로 사용자 조회/갱신
                                ↓
                      HTML 생성 (initialUser)
                                ↓
                      클라이언트 하이드레이션
                                ↓
                      Zustand 초기화 (initialUser)
                                ↓
                      컴포넌트 렌더링

  [API 호출 (인증 만료)]
  컴포넌트 → API Client → 백엔드 → 401 에러
                                ↓
                      자동 clearAuth()
                                ↓
                      useAuthGuard() 감지
                                ↓
                      로그인 페이지 이동

  이제 프론트엔드 인증 시스템의 전체 구조와 작동 원리를 이해하셨을 것입니다! 🎉