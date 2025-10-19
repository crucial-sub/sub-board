# API Reference

프론트엔드 연동을 위해 현재 구현된 주요 HTTP 엔드포인트와 응답 형식을 정리했습니다.

## 인증 (Auth)

### POST `/auth/register`
- 설명: 로그인 ID/닉네임/비밀번호로 회원가입 후 액세스/리프레시 토큰을 발급하며, HTTP Only 쿠키(`sb_access_token`, `sb_refresh_token`)로도 내려줍니다.
- 요청 Body
  ```json
  {
    "loginId": "string",
    "nickname": "string",
    "password": "string"
  }
  ```
- 응답 Body
  ```json
  {
    "user": {
      "id": "string",
      "loginId": "string",
      "nickname": "string",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    },
    "tokens": {
      "accessToken": "string",
      "refreshToken": "string",
      "accessTokenExpiresIn": 900,
      "refreshTokenExpiresIn": 1209600
    }
  }
  ```

### POST `/auth/login`
- 설명: 로그인 ID/비밀번호로 인증 후 토큰을 재발급하며 쿠키도 갱신합니다.
- 요청 Body: `loginId`, `password`
- 응답 Body: `/auth/register`와 동일한 구조

### POST `/auth/refresh`
- 설명: 쿠키에 저장된 리프레시 토큰으로 새 액세스/리프레시 토큰을 발급합니다. 요청 본문은 비어 있어도 됩니다.
- 응답 Body: `/auth/register`와 동일한 구조

### POST `/auth/logout`
- 설명: 모든 세션을 제거하고 인증 키 쿠키를 초기화합니다.
- 응답 Body: `{ "success": true }`

## 게시글 (Posts)

### POST `/posts`
- 보호됨: 쿠키(`sb_access_token`) 또는 `Authorization: Bearer` 토큰 필요
- 요청 Body
  ```json
  {
    "title": "string",
    "content": "string",
    "tags": ["string"]
  }
  ```
- 응답 Body
  ```json
  {
    "id": "string",
    "title": "string",
    "content": "string",
    "viewCount": 0,
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601",
    "author": {
      "id": "string",
      "loginId": "string",
      "nickname": "string"
    },
    "tags": [
      {
        "name": "string"
      }
    ]
  }
  ```

### GET `/posts`
- 쿼리: `page`, `pageSize`, `keyword`, `tag`
- 응답 Body
  ```json
  {
    "items": [
      {
        "id": "string",
        "title": "string",
        "viewCount": 0,
        "createdAt": "ISO8601",
        "updatedAt": "ISO8601",
        "author": {
          "id": "string",
          "loginId": "string",
          "nickname": "string"
        },
        "tags": [
          {
            "name": "string"
          }
        ]
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
  ```

### GET `/posts/:id`
- 응답 Body (viewCount는 조회 시 +1 증가)
  ```json
  {
    "id": "string",
    "title": "string",
    "content": "string",
    "viewCount": 1,
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601",
    "author": { ... },
    "tags": [
      {
        "name": "string"
      }
    ],
    "comments": [
      {
        "id": "string",
        "content": "string",
        "createdAt": "ISO8601",
        "author": {
          "id": "string",
          "loginId": "string",
          "nickname": "string"
        }
      }
    ]
  }
  ```

### GET `/posts/tags`
- 설명: 게시글에 사용된 태그와 게시글 수를 조회합니다.
- 응답 Body
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "count": 12
    }
  ]
  ```

### PATCH `/posts/:id`
- 보호됨 (작성자 본인만 수정 가능)
- 요청 Body: 수정할 `title`, `content`
- 응답 Body: 수정된 게시글 요약 정보

### DELETE `/posts/:id`
- 보호됨, 작성자 본인만 삭제 가능
- 응답 Body: `{ "id": "삭제된 게시글 ID" }`

## 댓글 (Comments)

### POST `/comments`
- 보호됨 (로그인 사용자만 작성 가능)
- 요청 Body
  ```json
  {
    "postId": "string",
    "content": "string"
  }
  ```
- 응답 Body
  ```json
  {
    "id": "string",
    "content": "string",
    "createdAt": "ISO8601",
    "author": {
      "id": "string",
      "loginId": "string",
      "nickname": "string"
    }
  }
  ```

### DELETE `/comments/:id`
- 보호됨, 작성자 본인만 삭제 가능
- 응답 Body: `{ "id": "삭제된 댓글 ID" }`

## 향후 작업 메모
- 프론트에서 쿠키 기반 인증 요청 시 `fetch` 옵션에 `credentials: "include"` 유지
- 게시글/댓글 작성 API에서 본문 Markdown 지원 여부 검토
- SSE 기반 실시간 댓글 스트리밍 고려
