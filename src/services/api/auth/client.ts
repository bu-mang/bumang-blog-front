import { LoginFormType } from "@/types/schemas";
import { END_POINTS } from "@/constants/api/endpoints";
import ClientInstance from "@/services/lib/axios";

// 로그인 (Client)
export async function postLogin(formData: LoginFormType) {
  const { username, password } = formData;

  // 토큰은 응답 본문이 아니라 httpOnly 쿠키로만 온다 — JS는 토큰을 볼 수 없다.
  const res = await ClientInstance.post<{
    success: boolean;
    message: string;
  }>(END_POINTS.POST_LOGIN, {
    email: username,
    password,
  });

  return res.data;
}

// 로그아웃 (Client)
export async function postLogout() {
  const res = await ClientInstance.post(END_POINTS.POST_LOGOUT, {});

  return res.data;
}
