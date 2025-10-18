// 회원가입 요청에서 수집해야 할 필수 필드 정의
export type RegisterInput = {
  loginId: string;
  nickname: string;
  password: string;
};
