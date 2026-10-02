import { cache } from "react";
import { cookies } from "next/headers";

import { END_POINTS } from "@/constants/api/endpoints";
import serverFetch from "@/services/lib/serverFetch";
import { isValidRole, UserResponseType, UserType } from "@/types/user";

// 현재 로그인한 사용자 (ServerFetch). 비로그인이면 null.
//
// 로그인 여부는 서버에서 확정해 레이아웃이 클라이언트로 내려준다(AuthProvider).
// 예전엔 헤더가 브라우저에서 프로필 API를 따로 불러 스토어에 넣었는데, 그러면 첫 화면이
// 비로그인 모양으로 그려졌다 바뀌고, "아직 모름" 상태를 기다리는 로직이 곳곳에 생기고,
// 익명 방문자는 페이지를 열 때마다 실패하는 호출(프로필 401 → 갱신 401)을 두 번 냈다.
//
// cache(): 한 요청을 그리는 동안 여러 곳에서 불러도 백엔드 호출은 한 번.
export const getCurrentUser = cache(async (): Promise<UserType | null> => {
  // 쿠키가 없으면 익명 — 백엔드를 부르지 않는다. access 토큰이 만료된 경우는
  // 미들웨어가 이 시점 이전에 갱신해 쿠키를 바꿔 끼워 둔다.
  if (!cookies().get("accessToken")) return null;

  try {
    const user = await serverFetch<UserResponseType>(
      process.env.NEXT_PUBLIC_API_BASE_URL + END_POINTS.GET_USER_PROFILE,
    );
    if (!isValidRole(user.role)) return null;

    return { id: user.id, nickname: user.nickname, role: user.role };
  } catch {
    // 토큰 무효·백엔드 장애 모두 익명으로 그린다(페이지를 죽이지 않는다).
    return null;
  }
});
