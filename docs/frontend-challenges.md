# Frontend Technical Challenges Roadmap

이번 게시판 과제와 앞으로 진행할 5주 팀프로젝트에서 프론트엔드 역할을 수행하며 시도해 볼 만한 기술적 챌린지를 정리했습니다. 각 항목은 적용 난이도와 기대 효과를 함께 정리했으니 우선순위에 맞춰 선택적으로 도전하면 됩니다.

## 데이터 패칭 & 네트워크 최적화

- **React Query 고도화**
  - `prefetchQuery`, `useQueryClient`를 활용해 게시글 목록 hover 시 상세 데이터를 미리 받아두고, hover 시 스켈레톤 없이 바로 렌더링.
  - `staleTime`, `cacheTime`을 조절해 목록/상세 전환 시 깜빡임 최소화.
- **조건부 GET & 304 활용**
  - `If-None-Match` / ETag 또는 `If-Modified-Since` 헤더를 백엔드와 협업해 도입.
  - 불필요한 payload를 줄여 모바일 네트워크 환경에서도 빠른 재요청 보장.
- **가시성 기반 스마트 폴링**
  - `IntersectionObserver`와 React Query의 `refetchInterval` 옵션을 조합해, 뷰포트 안에 있을 때만 날씨/주가/실시간 정보 등을 주기적으로 갱신.
- **SSE(WebSockets) 또는 이벤트 스트리밍**
  - 실시간 댓글 반영을 위해 `EventSource` 기반 SSE를 실험해 보고, React Query의 `queryClient.setQueryData`로 캐시 업데이트.
- **외부 API(날씨 등) 최적화**
  - 서버에서 프록시 캐싱, 클라이언트에서 Debounce 및 `keepPreviousData` 사용으로 깜빡임 없는 실시간 UI 구성.

## UI/UX 패턴

- **Optimistic UI 댓글/좋아요**
  - React Query `useMutation`의 `onMutate`/`onSettled`를 사용해 댓글 작성/삭제 시 즉시 UI를 업데이트 후 실패 시 롤백.
- **Infinite Scroll & Skeleton**
  - `useInfiniteQuery` + IntersectionObserver로 페이징이 보이지 않는 부드러운 스크롤을 구현하고, Skeleton/placeholder로 빈 순간 제거.
- **Prefetch 기반 퀵 미리보기**
  - 게시글 제목 hover 시 툴팁/프리뷰를 제공하고, `queryClient.prefetchQuery`로 상세 데이터를 선 로드.
- **Form UX & 입력 검증**
  - `zod` + `react-hook-form`으로 form state를 타이트하게 관리하고, 비동기 서버 검증과 결합.
  - 예: 닉네임 실시간 중복 체크, 글 작성 시 금지어 필터 등.

## 성능 & 접근성

- **레이지 로딩 및 코드 스플리팅**
  - Next.js App Router의 `dynamic` import를 활용해 관리자 페이지나 에디터/차트 등 무거운 컴포넌트를 지연 로드.
- **이미지/에셋 최적화**
  - Next.js `Image` 컴포넌트 + AVIF/WebP 포맷 사용, responsive image 설정으로 메인 리스트 최적화.
- **접근성(A11y)**
  - keyboard navigation, aria-live 영역 등을 이용해 실시간 갱신 UI에서도 접근성을 확보.

## 백엔드 협업 포인트

- **DB 인덱스 및 정렬 전략**
  - 게시판 목록이 조건(태그, 좋아요 순 등)에 따라 빠르게 응답하도록 인덱스 설계 실험.
  - PR 시 Postgres `EXPLAIN ANALYZE` 결과를 문서화해 근거 제시.
- **조건부 캐싱/헤더 협업**
  - 프론트 최적화(ETag, 304, Cache-Control)를 위해 NestJS에서 헤더를 설정하고, 테스트 케이스를 마련하여 프론트와 합동 검증.

## DevOps & 품질

- **Storybook + Visual Regression**
  - 주요 컴포넌트(게시글 카드, 댓글 리스트, 실시간 위젯)를 스토리로 관리하고 Chromatic 같은 도구로 변경사항 추적.
- **Lighthouse CI 자동화**
  - Next.js 빌드 후 Lighthouse CI를 돌려 성능/접근성/Best Practice 스코어를 기록.
- **GitHub Actions로 API Mock 테스트**
  - MSW(Mock Service Worker)를 활용해 API 통신을 모킹한 프론트 단위 테스트를 CI에서 반복.

## 추천 우선순위

1. **React Query 고도화 & Optimistic UI**: 팀프로젝트 협업 시에도 체감이 큰 UX 개선.
2. **Infinite Scroll + Prefetch**: 게시판 특성에 잘 맞고, 성능·사용성 모두 강화.
3. **날씨/실시간 위젯**: 외부 API 핸들링 경험을 쌓으며 백엔드 협업 포인트까지 경험.
4. **SSE 기반 실시간 댓글**: 초기 난이도는 있지만, 실시간 요구사항이 있는 프로젝트에 큰 무기로 작용.
5. **Zod + react-hook-form 입력 검증**: 프론트/백엔드 모두에서 재사용 가능한 스키마로 안정성 확보.

이 로드맵을 기반으로, 이번 과제에서 우선 구현해본 후 5주 팀 프로젝트에서 더욱 발전된 버전(예: 웹소켓 기반 실시간 알림, 관심 게시글 push 등)을 적용해 보면 도움이 될 거야.
