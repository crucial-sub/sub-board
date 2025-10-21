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
  - 현재는 주요 레이아웃과 데이터 로딩을 서버 컴포넌트가 담당하고, 상호작용이 필요한 영역만 클라이언트 컴포넌트로 분리했다. (예: `SiteHeader`에서 로그아웃 버튼만 클라이언트로 동작, 게시판/검색 페이지는 서버에서 초기 데이터를 공급하고 필터 UI만 클라이언트로 유지)

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
│     ├─ api.ts          # 게시글/댓글 작성/삭제 API 래퍼
│     ├─ components      # PostCard, PostDetail, CommentForm, PostList 등
│     ├─ hooks           # React Query 훅, mutation 훅, 태그 훅
│     ├─ server          # 서버 컴포넌트에서 사용할 fetch 헬퍼 (posts/tags 초기 데이터)
│     └─ types.ts        # 게시글/댓글/태그 응답 타입
├─ hooks                 # 공용 React Query 훅 모음 (usePostsQuery 등)
├─ lib                   # 공용 유틸 (`api-client`, `server-api-client` 등)
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
      <body className="text-text-primary">
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
- 글로벌 `globals.css`에서 파스텔 톤 그라디언트와 리퀴드 글래스 질감을 정의하므로 `<body>`에는 텍스트 컬러만 지정하면 된다.

---

## 4. 레이아웃 컴포넌트 & 공통 UI

### `components/layout/site-header.tsx`
- 서버 컴포넌트로 동작하며 `getCurrentUserOnServer()`를 호출해 헤더 HTML을 SSR 단계에서 완성한다.  
- 로그아웃 버튼만 별도의 클라이언트 컴포넌트(`LogoutButton`)로 분리해 `useLogoutMutation`을 실행한다.  
- 상단바는 반투명 화이트와 얇은 브랜드 언더라인으로 구성돼 Apple식 리퀴드 글래스 톤을 연출하며, `btn-gradient` / `btn-outline` 유틸 클래스로 CTA를 통일했다.

### Tailwind 사용 패턴
- 파스텔 그라디언트와 글라스 효과가 반복되므로 `globals.css`에 `surface-card`, `surface-glass`, `btn-gradient`, `btn-outline`, `gradient-text`, `tag` 등을 컴포넌트 레이어로 선언해 재사용한다.  
- `text-text-primary`, `text-text-secondary`, `border-border-muted` 등은 Tailwind 설정에서 정의한 커스텀 컬러.  
- 반응형은 `md:flex-row`, `sm:hidden` 같은 breakpoint 변형을 사용.

### 실시간 위젯 영역
- 홈 화면 하단의 `CalloutPanels` 영역은 현재 비워 둔 상태이며, 향후 도입할 실시간/외부 데이터 위젯을 배치하기 위한 자리다.

### 실시간 알림 흐름
- 백엔드는 `NotificationsModule`에서 SSE(`/notifications/stream`)를 제공한다. 새 게시글이 등록되면 모든 구독자에게 `post.created` 이벤트를 브로드캐스트하고, 내 글에 새로운 댓글이 달리면 작성자에게 `comment.created` 이벤트가 전송된다.
- 프론트엔드는 `NotificationToaster`가 `EventSource`로 스트림을 구독해 알림을 Zustand 스토어에 쌓고, 상단 우측에 토스트 카드 형태로 잠시 표시한다.

---

## 5. 인증 도메인 (`features/auth`)

### `state/auth-store.tsx`
- `AuthStoreProvider`가 서버에서 전달한 초기 세션으로 스토어를 생성해 첫 렌더부터 `hasHydrated` 상태를 true로 맞춘다.  
앞서 언급한 Zustand 스토어. 주요 액션:
- `setFromResponse(payload)`: 로그인/회원가입/리프레시 응답을 상태에 저장.
- `clearAuth()`: 로그아웃 혹은 401 발생 시 사용자 정보 제거.
- `markHydrated()`: 세션 동기화 완료 플래그 (클라이언트 훅들이 초기 상태를 구분하는 데 사용).

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
  - `initialData` 옵션을 받아 SSR 단계에서 가져온 첫 페이지 데이터를 그대로 캐시에 채워 넣는다.  
  - `useInfiniteQuery`는 무한 스크롤용(추후 홈에서 사용 예정).
- `usePostDetailQuery`: 게시글 + 댓글 데이터를 가져오며, 상세 페이지 역시 `initialData`로 첫 응답을 전달한다.
- `usePostsTagsQuery`: `/posts/tags` 응답을 받아 태그 리스트와 게시글 수를 제공하고, 서버에서 전달한 태그 요약 배열을 `initialData`로 초기화한다.

### 6.3 Mutation 훅 (`hooks/usePostMutations.ts`)
- `useCreatePost`  
  - 성공 시 `["posts"]`, `["posts","tags"]` query invalidate → 목록과 태그 카운트 재계산.
- `useCreateComment`, `useDeleteComment`  
  - 성공 시 해당 게시글 상세(`["post", postId]`) 캐시 무효화.

### 6.4 컴포넌트
- **PostCard**: 게시글 요약 카드. 작성자, 시간, 조회 수, 태그 표시.  
- **PostDetail**: 상세 페이지 UI. 서버에서 전달한 `initialData`로 React Query 캐시를 채우고, 댓글 작성/삭제 같은 상호작용만 클라이언트에서 처리한다.  
- **PostList**: 페이징/무한 스크롤을 mode로 전환하며, 초기에 전달된 페이지 데이터를 `initialData`로 사용해 첫 렌더 스피너를 없앤다.  
- **CommentForm**: 댓글 작성 폼. 인증 여부에 따른 UI 처리.

### 6.5 페이지들
- `(main)/page.tsx` (홈)  
  - 서버에서 현재 사용자와 `/users/me/stats` 응답을 미리 받아 `HomePageClient`에 전달한다.  
  - 클라이언트에서는 React Query가 `initialData`로 받은 통계를 재사용하면서 상호작용 없는 UI만 렌더링한다.
- `(main)/posts/page.tsx` (게시판 목록)  
  - 서버 컴포넌트에서 `fetchPostsTags`, `fetchPostsList`로 초기 데이터를 받아 `PostsPageClient`에 넘긴다.  
  - 클라이언트에서는 태그 필터/페이지 전환만 상태로 관리하며, `usePostsTagsQuery`와 `PostList`가 `initialData`를 활용한다.
- `(main)/posts/new/page.tsx` (새 글 작성)  
  - 태그 입력 UI: 최대 10개, 중복 제거, IME 입력(한글) 처리 (`isComposing` 체크).  
  - 글 작성 후 태그 포함 payload로 `createPost` 호출.  
- `(main)/search/page.tsx` (검색)  
  - URL의 `keyword`를 서버에서 읽어 첫 페이지 결과를 미리 패칭한다.
  - `SearchPageClient`가 폼/페이지네이션 상호작용을 담당하고, React Query는 전달받은 `initialData`를 초기 캐시로 사용한다.
- `(main)/posts/[id]/page.tsx` (상세)  
  - 서버에서 `fetchPostDetail`로 데이터를 가져오고, 실패 시 `notFound()` 처리.  
  - `PostDetail` 컴포넌트는 전달받은 `initialData` 기반으로 즉시 본문/댓글을 렌더링한다.

---

## 7. React Query 동작 상세

### Query Hook 예시
```ts
useQuery({
  queryKey: ["posts", page, pageSize, keyword, tag],
  queryFn: () => apiClient.get(`/posts?...`),
  initialData, // 서버 컴포넌트에서 전달한 첫 페이지 데이터를 그대로 사용
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
| `/users/me/stats` | GET | 로그인 사용자의 게시글/댓글/태그 통계 조회 |
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
