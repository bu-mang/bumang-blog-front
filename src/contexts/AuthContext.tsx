"use client";

import { createContext, ReactNode, useContext } from "react";
import { UserType } from "@/types/user";

// 로그인한 사용자. 서버(레이아웃)가 요청마다 확정해서 내려준 값을 그대로 담는다.
//
// 전역 스토어(zustand)가 아니라 context인 이유: 값이 서버 렌더 시점에 이미 정해져 있어야
// 첫 화면부터 맞게 그려지는데, 모듈 전역 스토어는 서버에서 요청끼리 공유돼 다른 방문자의
// 로그인 정보가 섞일 수 있다. context는 요청마다 따로 만들어진다.
//
// 로그인·로그아웃은 전체 새로고침으로 끝나므로 이 값을 클라이언트에서 바꿀 일이 없다.
const AuthContext = createContext<UserType | null>(null);

interface AuthProviderProps {
  user: UserType | null;
  children: ReactNode;
}

export function AuthProvider({ user, children }: AuthProviderProps) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const user = useContext(AuthContext);
  return { user, isAuthenticated: user !== null };
}
