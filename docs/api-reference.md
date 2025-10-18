# API Reference

프론트엔드 연동을 위해 현재 구현된 주요 HTTP 엔드포인트와 응답 형식을 정리했습니다.

## 인증 (Auth)

### POST `/auth/register`
- 설명: 로그인 ID/닉네임/비밀번호로 회원가입을 수행하고 즉시 액세스/리프레시 토큰을 발급합니다.
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
- 설명: 로그인 ID/비밀번호로 인증 후 토큰을 재발급합니다.
- 요청 Body: `loginId`, `password`
- 응답 Body: `/auth/register`와 동일한 구조

## 게시글 (Posts)

### POST `/posts`
- 보호됨: `Authorization: Bearer <accessToken>` 필요
- 요청 Body
  ```json
  {
    "title": "string",
    "content": "string"
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
    }
  }
  ```

### GET `/posts`
- 쿼리: `page`, `pageSize`
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
        }
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

### PATCH `/posts/:id`
- 보호됨
- 요청 Body: 수정할 `title`, `content`
- 응답 Body: 수정된 게시글 요약 정보

### DELETE `/posts/:id`
- 보호됨, 작성자만 삭제 가능
- 응답 Body: `{ "id": "삭제된 게시글 ID" }`

## 댓글 (Comments)

### POST `/comments`
- 보호됨
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
- 보호됨, 작성자만 삭제 가능
- 응답 Body: `{ "id": "삭제된 댓글 ID" }`

## 향후 작업 메모
- 토큰 갱신(`/auth/refresh`) 및 로그아웃 API 구현 예정
- Access Token 만료 시 Refresh Token을 활용하는 정책 정리 필요
- 게시글/댓글 작성 API에서 본문 Markdown 지원 여부 검토
