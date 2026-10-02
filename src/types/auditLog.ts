export interface LoginAttempt {
  id: number;
  email: string;
  userId: number | null;
  success: boolean;
  // 'user_not_found' | 'password_mismatch' | null(성공)
  failureReason: string | null;
  ip: string | null;
  country: string | null;
  // 시/도. Cloudflare 위치 헤더 기반이라 대략적이고 비어 있을 수 있다.
  region: string | null;
  city: string | null;
  // 요청을 받은 Cloudflare 엣지(공항 코드, 예: ICN/LAX).
  colo: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface LoginAttemptPage {
  items: LoginAttempt[];
  total: number;
  pageIndex: number;
  pageSize: number;
}

// 포스트 상세 조회 기록. 익명 조회도 남는다(userId·userEmail이 null).
export interface ContentView {
  id: number;
  // null이면 비로그인 방문자.
  userId: number | null;
  // 기록 시점 스냅샷 — 유저가 탈퇴·변경돼도 남는다.
  userEmail: string | null;
  postId: number;
  // 기록 시점 스냅샷. denied면 null(권한이 없어 글을 못 읽었으므로).
  postTitle: string | null;
  // readPermission 미달로 403을 받은 시도.
  denied: boolean;
  // audience 불일치로 마스킹된 블록 수. 0이면 전문을 다 본 것.
  maskedBlockCount: number;
  ip: string | null;
  country: string | null;
  // 시/도. Cloudflare 위치 헤더 기반이라 대략적이고 비어 있을 수 있다.
  region: string | null;
  city: string | null;
  // 요청을 받은 Cloudflare 엣지(공항 코드, 예: ICN/LAX).
  colo: string | null;
  // 유입 경로(Referer). 직접 방문이면 null.
  referer: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface ContentViewPage {
  items: ContentView[];
  total: number;
  pageIndex: number;
  pageSize: number;
}
