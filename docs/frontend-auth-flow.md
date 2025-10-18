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
