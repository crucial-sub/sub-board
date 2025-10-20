# 프론트엔드 아키텍처 상세 설명 (2025-10-19 기준)

> 이 문서는 `apps/web` 디렉터리 전체를 훑어보며 “Next.js + React + Tailwind + React Query + Zustand” 조합이 어떤 식으로 동작하는지, 그리고 각 파일/모듈이 맡은 역할이 무엇인지 하나하나 정리한다. **모든 기능 흐름과 라이브러리 사용 이유**를 이해하는 데 목적이 있다.

---

## 0. 사용 기술과 선택 이유 요약

| 기술 | 사용 이유 / 특징 | 이 프로젝트에서의 활용 |
|------|-----------------|-------------------------|
| **Next.js 15 (App Router)** | React 위에서 파일 기반 라우팅, 서버/클라이언트 컴포넌트 분리, 간편한 레이아웃 구성 제공 | `/app` 폴더 구조만으로 라우팅을 정의, 전역 레이아웃(`layout.tsx`)과 페이지(`page.tsx`)를 자동 연결 |
| **React** | 컴포넌트 기반 UI 라이브러리 | 페이지 및 기능별 UI를 함수형 컴포넌트로 작성 |
| **TypeScript** | 정적 타입, IDE 지원 | DTO, API 응답, 컴포넌트 prop 타입 안전성 확보 |
| **Tailwind CSS** | Utility-first 스타일링 | 각 컴포넌트에서 클래스 조합으로 UI 구현. 프로젝트 전반 같은 톤 유지 |
| **React Query (@tanstack/react-query)** | 서버 상태(fetch한 데이터) 캐시와 비동기 흐름 관리 | 게시글/댓글/태그 리스트를 캐싱, mutation 성공 시 invalidate로 UI 자동 갱신 |
| **Zustand** | 가벼운 전역 상태 (Redux보다 단순) | 인증 상태(user, hasHydrated)와 관련 액션을 중앙에서 관리 |
| **Next Navigation APIs** | `useRouter`, `useSearchParams` 등 | 클라이언트 측 페이지 전환, 쿼리 파라미터 읽기 |
| 기타 | `date-fns` 등 없음 | 필요 시 확장 가능 |

---

## 1. Next.js와 일반 React의 구조적 차이

1. **파일 기반 라우팅**  
   - React에서는 `react-router-dom` 설정이 필요하지만, Next.js App Router는 `app/(group)/page.tsx` 파일만 생성하면 `/group` 경로가 자동 생성된다.
   - `(auth)`/`(main)` 같은 괄호 폴더는 그룹화를 위한 장치로 URL에는 드러나지 않는다.

2. **서버/클라이언트 컴포넌트**  
   - App Router의 기본은 서버 컴포넌트.  
   - 브라우저 상호작용(상태 관리, `useEffect`)이 필요할 땐 컴포넌트 상단에 `"use client"` 선언 → 클라이언트 컴포넌트가 된다.  
   - 현재 프로젝트는 전부 `"use client"`로 선언해 SSR 기능을 적극 활용하지는 않았지만, 필요 시 서버 컴포넌트로 옮길 수 있다.

3. **레이아웃 시스템**  
   - `app/layout.tsx`에서 전역 Provider와 `<body>` 구성을 담당한다.  
   - 각 라우트 그룹도 자체 레이아웃을 가질 수 있어 공용 UI를 쉽게 공유 가능.

4. **데이터 패칭 전환 가능성**  
   - 지금은 React Query로 클라이언트 패칭을 활용하지만, Next.js는 서버 컴포넌트에서 직접 데이터 fetch 후 HTML에 주입하는 방식을 지원한다.  
   - 장점: SEO 최적화, 초기 렌더 속도 향상. 단, 이 프로젝트는 인증/상태와 긴밀하게 연동되므로 클라이언트 상태 접근이 쉬운 React Query 방식이 적합했다.

---

## 2. 전체 폴더 구조와 책임

```
apps/web/src
├─ app/                  # Next.js App Router 페이지
│  ├─ (auth)/login       # 로그인 페이지
│  ├─ (auth)/register    # 회원가입 페이지
│  ├─ (main)/page.tsx    # 홈 화면 (로그인 후)
│  ├─ (main)/posts       # 게시판 목록, 새 글 작성, 상세 페이지
│  ├─ (main)/search      # 검색 페이지
│  └─ layout.tsx         # 공통 레이아웃 (헤더, Provider 등)
├─ components/layout     # 공통 레이아웃 구성 요소 (예: SiteHeader)
├─ features/
│  ├─ auth               # 인증 도메인
│  │  ├─ api.ts          # 인증 API 래퍼 (login, register 등)
│  │  ├─ components      # AuthForm 등 인증 UI 조각
│  │  ├─ hooks           # useAuthGuard, useAuthMutations
│  │  ├─ server          # SSR 인증 유틸 (getCurrentUserOnServer)
│  │  └─ state           # Zustand 스토어 Provider (AuthStoreProvider)
│  └─ posts              # 게시글 도메인
│     ├─ api.ts          # 게시글/댓글 API 래퍼
│     ├─ components      # PostCard, PostDetail, CommentForm, PostList 등
│     ├─ hooks           # React Query 훅, mutation 훅, 태그 훅
│     └─ hooks/useTagsQuery.ts # 태그 목록 조회 훅
├─ hooks                 # 공용 React Query 훅 모음 (usePostsQuery 등)
├─ lib                   # 공용 유틸 (ApiClient 등)
├─ providers             # Global Provider (React Query, UI hydration 등)
└─ styles                # Tailwind 글로벌 CSS
```

### 구조 설계 이유
- 도메인(`auth`, `posts`)별로 **API / 상태 / UI**를 한 폴더에 모아 cohesion을 높였다.  
- 페이지(`app/(main)/posts/…`)에서는 `features/posts`의 모듈을 조합해 화면을 구성한다.
- Provider 레벨(`providers/react-query-provider.tsx`, `providers/ui-provider.tsx`)에서 전역 상태와 React Query 클라이언트를 공급한다.

---

## 3. Global Provider와 레이아웃

### `app/layout.tsx`
```tsx
export default async function RootLayout({ children }) {
  const currentUser = await getCurrentUserOnServer();

  return (
    <html lang="ko">
      <body className="bg-bg-app text-text-primary">
        <UiProvider initialUser={currentUser}>
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </UiProvider>
      </body>
    </html>
  );
}
```
- **UiProvider** (`providers/ui-provider.tsx`): 서버에서 전달한 `currentUser`를 `AuthStoreProvider` 초기 상태로 주입해 첫 렌더부터 로그인 상태가 유지된다.
- **ReactQueryProvider** (`providers/react-query-provider.tsx`): React Query 클라이언트를 생성하고 `QueryClientProvider`로 감싼다.  
- Tailwind 기본 배경/텍스트 색상을 `<body>`에 적용.

---

## 4. 레이아웃 컴포넌트 & 공통 UI

### `components/layout/site-header.tsx`
- `"use client"` 선언 → 클라이언트에서만 렌더.  
- `useAuthStore`로 로그인 상태와 hydration 여부를 읽고, 로그인 여부에 따라 버튼을 분기한다.  
- `logout` 버튼 클릭 시 `useLogoutMutation` → `/auth/logout` 호출 후 Zustand 스토어 초기화.
- 기본적으로 서버에서 전달된 세션으로 즉시 실제 UI를 렌더하며, 예외적으로 `hasHydrated`가 `false`인 경우에만 스켈레톤(`animate-pulse`)을 노출한다.

### Tailwind 사용 패턴
- `className="border-b border-border-muted bg-white/70 backdrop-blur"`처럼 여러 유틸 클래스를 조합.  
- `text-text-primary`, `text-text-secondary` 등은 Tailwind 설정에서 정의한 커스텀 컬러.  
- 반응형은 `md:flex-row`, `sm:hidden` 같은 breakpoint 변형을 사용.

---

## 5. 인증 도메인 (`features/auth`)

### `state/auth-store.tsx`
- `AuthStoreProvider`가 서버에서 전달한 초기 세션으로 스토어를 생성해 첫 렌더부터 `hasHydrated` 상태를 true로 맞춘다.  
앞서 언급한 Zustand 스토어. 주요 액션:
- `setFromResponse(payload)`: 로그인/회원가입/리프레시 응답을 상태에 저장.
- `clearAuth()`: 로그아웃 혹은 401 발생 시 사용자 정보 제거.
- `markHydrated()`: 세션 동기화 완료 플래그 (헤더가 로딩 상태를 판단하는 데 사용).

### `server/get-current-user.ts`
- `getCurrentUserOnServer()`가 SSR 단계에서 현재 세션을 조회한다.  
- `GET /auth/profile`로 액세스 토큰을 검증하고, 401이면 `POST /auth/refresh`를 호출해 토큰을 재발급한 뒤 Next.js 응답 쿠키에 반영한다.

### `hooks/useAuthMutations.ts`
- `useRegisterMutation`, `useLoginMutation`, `useLogoutMutation`, `useHydrateAuthSession` 등.  
- React Query의 `useMutation` 사용 → 성공/실패 시 상태 업데이트 및 라우팅 (`router.push`).  
- 인증과 관련된 모든 서버 요청은 이 훅들을 통해 처리하므로, 페이지/컴포넌트는 로직을 몰라도 된다.

### `components/auth-form.tsx`
- 로그인/회원가입 폼 → `mode` prop으로 분기.  
- `useLoginMutation`, `useRegisterMutation` 사용.  
- zustand, react-query와 결합되어 UX 매끄럽다.

---

## 6. 게시글 도메인 (`features/posts`)

### 6.1 API 래퍼 (`api.ts`)
```ts
export function createPost(payload: CreatePostPayload) {
  return apiClient.post<{ id: string }>({ path: "/posts", body: payload });
}
export function createComment(...) { ... }
export function deleteComment(commentId: string) { ... }
```
- 모든 요청이 `apiClient`를 거치므로 에러 처리/쿠키 설정이 일관된다.

### 6.2 React Query 훅
- `usePostsQuery`, `usePostsInfiniteQuery` (`src/hooks/usePostsQuery.ts`)  
  - 서버에서 `page`, `pageSize`, `keyword`, `tag` 쿼리를 처리하도록 맞춘다.  
  - `useInfiniteQuery`는 무한 스크롤용(추후 홈에서 사용 예정).
- `usePostDetailQuery`: 게시글 + 댓글 데이터를 가져온다.
- `usePostsTagsQuery`: `/posts/tags` 응답을 받아 태그 리스트와 게시글 수를 제공.

### 6.3 Mutation 훅 (`hooks/usePostMutations.ts`)
- `useCreatePost`  
  - 성공 시 `["posts"]`, `["posts","tags"]` query invalidate → 목록과 태그 카운트 재계산.
- `useCreateComment`, `useDeleteComment`  
  - 성공 시 해당 게시글 상세(`["post", postId]`) 캐시 무효화.

### 6.4 컴포넌트
- **PostCard**: 게시글 요약 카드. 작성자, 시간, 조회 수, 태그 표시.  
- **PostDetail**: 상세 페이지 UI. 댓글 목록/작성 폼, 태그 링크, 삭제 버튼.  
- **PostList**: 페이징/무한 스크롤을 mode로 전환.  
- **CommentForm**: 댓글 작성 폼. 인증 여부에 따른 UI 처리.

### 6.5 페이지들
- `(main)/posts/page.tsx` (게시판 목록)  
  - 태그 필터 UI, 선택된 태그를 React Query에 전달.  
  - `useSearchParams()`와 연동해 `?tag=…` 주소 공유 가능.
- `(main)/posts/new/page.tsx` (새 글 작성)  
  - 태그 입력 UI: 최대 10개, 중복 제거, IME 입력(한글) 처리 (`isComposing` 체크).  
  - 글 작성 후 태그 포함 payload로 `createPost` 호출.  
- `(main)/search/page.tsx` (검색)  
  - 키워드 입력 후 `usePostsQuery`로 검색.  
  - pagination 버튼으로 페이지 이동 가능, 결과 카드를 표시하고 태그 목록도 보여줌.
- `(main)/posts/[id]/page.tsx` (상세)  
  - `PostDetail` 사용. `PostDetail`에서 태그를 클릭하면 게시판 태그 필터로 이동.

---

## 7. React Query 동작 상세

### Query Hook 예시
```ts
useQuery({
  queryKey: ["posts", page, pageSize, keyword, tag],
  queryFn: () => apiClient.get(`/posts?...`),
});
```
- `queryKey`가 변경될 때만 새 데이터 fetch → 페이지/필터 별로 캐시가 분리됨.
- 로딩/에러 상태는 hook이 반환하는 `isLoading`, `isError`로 처리.

### Mutation Hook 예시
```ts
useMutation({
  mutationFn: createPost,
  onSuccess: () => {
    void queryClient.invalidateQueries({ queryKey: ["posts"] });
    void queryClient.invalidateQueries({ queryKey: ["posts", "tags"] });
  },
});
```
- 게시글 작성 성공 시 목록과 태그 요약 cache를 새로 요청.  
- `invalidateQueries`는 다음 렌더에서 자동으로 리페치하게 만든다.

### API Client 에러 처리
- `ApiError`에 상태 코드와 메시지를 담아 throw.  
- ValidationPipe가 반환하는 에러 배열도 문자열로 합쳐서 UI에서 그대로 표시.  
- 401이면 Zustand 스토어에서 `clearAuth()` → 헤더/페이지가 즉시 로그아웃 상태로 반응.

---

## 8. Tailwind 스타일 구성

- Tailwind는 `styles/globals.css`에서 초기화, Project 색상 및 폰트 커스텀 설정.  
- 컴포넌트의 `className` 속성에 여러 유틸 클래스를 지정:
  - 예: `className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white shadow-card transition hover:bg-brand-hover"`
  - `bg-brand`, `shadow-card` 등은 Tailwind 설정에서 미리 지정한 커스텀 값.  
  - 반응형: `md:grid-cols-2`, `xl:grid-cols-3` 등 breakpoints 사용.

---

## 9. 주요 커스텀 훅 정리

| 훅 | 위치 | 역할 |
|----|------|------|
| `useAuthGuard` | `features/auth/hooks/useAuthGuard.ts` | 보호 페이지에서 로그인 상태 확인, 없으면 `/login` 이동 |
| `useAuthMutations` | `features/auth/hooks/useAuthMutations.ts` | 로그인/회원가입/로그아웃 mutation |
| `useHydrateAuthSession` | `features/auth/hooks/useAuthMutations.ts` | 필요 시 `/auth/refresh`로 세션 갱신 |
| `usePostsQuery` | `hooks/usePostsQuery.ts` | 페이지네이션 목록 fetch |
| `usePostsInfiniteQuery` | 동일 | 무한 스크롤 fetch |
| `usePostDetailQuery` | `features/posts/hooks/usePostDetailQuery.ts` | 게시글 상세 데이터 fetch |
| `usePostsTagsQuery` | `features/posts/hooks/useTagsQuery.ts` | 태그 요약 fetch |
| `useCreatePost` 등 | `features/posts/hooks/usePostMutations.ts` | 게시글/댓글 작성/삭제 mutation |

각 훅은 React Query hooks(`useQuery`, `useMutation`)를 감싸고 있어 컴포넌트는 hook을 호출하면 로직을 몰라도 된다.

---

## 10. 서버 연동 (REST API)

클라이언트는 `NEXT_PUBLIC_API_BASE_URL` 환경 변수(기본 `http://localhost:3001`)를 사용하여 NestJS API와 소통한다. 주요 엔드포인트:

| 엔드포인트 | HTTP | 설명 |
|------------|------|------|
| `/auth/register` | POST | 회원가입, 성공 시 토큰 + 쿠키 세팅 |
| `/auth/login` | POST | 로그인, 토큰 재발급 + 쿠키 갱신 |
| `/auth/profile` | GET | 액세스 토큰으로 현재 사용자 조회 |
| `/auth/refresh` | POST | 리프레시 토큰 기반 재발급 |
| `/auth/logout` | POST | 세션 삭제, 쿠키 초기화 |
| `/posts` | GET | 게시글 목록 (`page`, `pageSize`, `keyword`, `tag`) |
| `/posts` | POST | 새 글 작성 (제목, 내용, 태그) |
| `/posts/:id` | GET | 게시글 상세, 조회 수 증가 |
| `/posts/:id` | PATCH/DELETE | 작성자 한정 수정/삭제 |
| `/posts/tags` | GET | 태그 리스트 + 게시글 카운트 |
| `/comments` | POST | 댓글 작성 |
| `/comments/:id` | DELETE | 댓글 삭제 |

React Query가 `apiClient`를 통해 이 엔드포인트들을 호출한다.

---

## 11. 태그 기능 흐름 (최근 추가)

1. **백엔드**  
   - Prisma에 `Tag` 모델 추가 (게시글과 다대다).  
   - `/posts` 목록/상세 응답에 `tags` 배열 포함.  
   - `GET /posts/tags`로 태그 이름 + 게시글 수 반환.  
   - Create/Update 시 `connectOrCreate`로 태그를 연결.

2. **프론트**  
   - 새 글 작성 페이지에서 태그 입력: 최대 10개, 중복 방지, IME 대응(`isComposing`).  
   - 게시판 페이지에서 태그 버튼을 눌러 필터 (`PostList`에 `tag` prop 전달).  
   - 검색 결과와 게시글 카드에서 태그를 시각적으로 노출.  
   - React Query mutation 성공 시 태그 캐시를 invalidate해 카운트를 갱신.

---

## 12. 요약 & 향후 확장 포인트

- Next.js App Router 기반 구조로 페이지/레이아웃 분리가 명확하며, 도메인 별로 `features/*`에 로직을 모아 유지보수가 용이하다.
- React Query + Zustand 조합으로 **서버 상태**와 **인증 상태**를 명확히 분리 관리.  
- Tailwind CSS로 빠르게 UI 스타일을 통일.  
- 태그 기능까지 더해져 게시판 필터링 UX가 향상되었다.

**향후 확장 아이디어**
- 게시글/댓글 수정 시 낙관적 업데이트 적용.  
- 무한 스크롤을 홈 화면에 적용.  
-.server 컴포넌트로 일부 데이터 패칭 전환 → 초기 로딩 속도 개선.  
- 다국어 지원(i18n), 다크 모드, Skeleton 개량 등 UI 확장.

---

이 문서가 프로젝트 구조 이해에 도움이 되길 바라며, 새로운 기능을 추가할 때는 해당 도메인의 `features/*` 폴더를 기준으로 API → 상태 → UI 흐름을 따라가면 빠르게 파악할 수 있다. 언제든지 궁금한 부분이 있으면 알려주길! 😊
