// 서버 컴포넌트에서 사용할 기본 fetch 래퍼

import { cookies, headers } from "next/headers";

/**
 * 백엔드로 이어서 넘길 "방문자 신원" 헤더들.
 *
 * SSR에서는 백엔드로 나가는 요청의 출발지가 방문자가 아니라 Next 서버다.
 * 그래서 이 헤더들을 손으로 넘기지 않으면 백엔드의 extractRequestMeta가
 * 방문자 대신 Next 서버를 기록한다 — 감사 로그의 IP·국가·UA가 전부
 * 같은 값으로 굳어버린다(익명 조회 기록을 켜면 특히 치명적이다:
 * 서로 다른 방문자가 IP 하나로 뭉개진다).
 */
const VISITOR_HEADERS = [
  "cf-ipcountry", // 국가 코드
  "cf-region", // 시/도 (Cloudflare Managed Transforms "Add visitor location headers")
  "cf-ipcity", // 도시 (위와 같은 설정)
  "x-forwarded-for", // 방문자 IP 체인 (백엔드는 첫 항목을 방문자로 본다)
  "user-agent", // 방문자 브라우저 (봇 판별의 유일한 단서)
  "referer", // 유입 경로 (방문자가 이 페이지로 오기 직전 주소)
] as const;

/**
 * ⚠️ Cloudflare를 다시 통과하는 요청에는 절대 붙이면 안 되는 헤더.
 *
 * Cloudflare는 외부에서 들어온 요청에 cf-connecting-ip가 이미 붙어 있으면
 * 값과 무관하게 403(error 1000)으로 거절한다. 2026-09-06에 이 헤더를 공개
 * 도메인(api.bumang.xyz)으로 전달했다가 프로덕션의 모든 글 상세 SSR이 죽었다.
 * 그래서 Cloudflare를 거치지 않는 내부 경로(API_INTERNAL_URL)로 나갈 때만 넘긴다.
 * 백엔드는 이 헤더를 최우선으로 읽으므로, 내부 경로에서는 이게 곧 방문자 IP다.
 */
const CF_CONNECTING_IP = "cf-connecting-ip";

/**
 * 방문자 요청을 받은 Cloudflare 엣지를 담은 헤더(꼬리표가 ICN/LAX 같은 공항 코드).
 * 백엔드가 "한국 방문자가 해외 엣지로 빠지는 비율"을 보려고 기록한다.
 * Cloudflare가 요청마다 새로 붙이는 값이라 공개 경로로는 넘길 의미가 없고,
 * cf-connecting-ip처럼 거절당할 여지도 남기지 않으려고 내부 경로로만 넘긴다.
 */
const CF_RAY = "cf-ray";

/**
 * 같은 호스트(도커 네트워크) 안의 백엔드로 직행하는 주소.
 *
 * 프로덕션에서 프론트와 백엔드는 같은 EC2, 같은 compose 네트워크에 있다. 그런데
 * 공개 주소(NEXT_PUBLIC_API_BASE_URL)로 부르면 인터넷 → Cloudflare → nginx를
 * 한 바퀴 돌아 옆 컨테이너로 들어온다. 지연도 낭비지만 더 큰 문제는 Cloudflare가
 * 중간에 끼어 위의 헤더 제약이 생긴다는 것. 그래서 서버 사이드는 이 값이 있으면
 * 공개 주소 대신 내부 주소로 바꿔 부른다(compose의 frontend.environment에서 주입).
 * 로컬 개발에서는 비어 있고, 그러면 공개 주소를 그대로 쓴다.
 */
const API_INTERNAL_URL = process.env.API_INTERNAL_URL;
const API_PUBLIC_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * 호출부는 공개 주소로 URL을 만들어 넘긴다. 내부 주소가 설정돼 있고 그 URL이
 * 공개 API를 향한다면 앞부분만 내부 주소로 바꾼다. 그 외(외부 서비스 등)는 손대지 않는다.
 */
function resolveServerUrl(url: string): { url: string; internal: boolean } {
  if (API_INTERNAL_URL && API_PUBLIC_URL && url.startsWith(API_PUBLIC_URL)) {
    return {
      url: API_INTERNAL_URL + url.slice(API_PUBLIC_URL.length),
      internal: true,
    };
  }
  return { url, internal: false };
}

// lib/serverFetch.ts
export default async function serverFetch<T>(
  url: string,
  options: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;
  const target = resolveServerUrl(url);

  // 헤더 설정
  let headersToUse: Headers;
  if (fetchOptions.headers instanceof Headers) {
    headersToUse = new Headers(fetchOptions.headers);
  } else if (fetchOptions.headers) {
    headersToUse = new Headers(fetchOptions.headers);
  } else {
    headersToUse = new Headers();
  }

  // 방문자 신원 헤더를 그대로 이어 넘긴다(호출부가 명시한 값이 있으면 그쪽 우선).
  // headers()는 요청 스코프 밖(정적 생성 등)에서 던질 수 있으므로 실패해도 그냥 넘어간다.
  try {
    const incoming = headers();
    const namesToForward: readonly string[] = target.internal
      ? [CF_CONNECTING_IP, CF_RAY, ...VISITOR_HEADERS]
      : VISITOR_HEADERS;
    for (const name of namesToForward) {
      if (headersToUse.has(name)) continue;
      const value = incoming.get(name);
      if (value) headersToUse.set(name, value);
    }
  } catch {
    // 요청 컨텍스트 없음 — 방문자 정보 없이 진행한다.
  }

  // 공개 경로로 나가는데 호출부가 cf-connecting-ip를 직접 넣었다면 그것도 걷어낸다.
  // Cloudflare가 403으로 튕겨서 요청 자체가 실패하기 때문이다.
  if (!target.internal) {
    headersToUse.delete(CF_CONNECTING_IP);
    headersToUse.delete(CF_RAY);
  }

  // 서버 컴포넌트에서 쿠키 가져오기
  if (!skipAuth) {
    const cookieStore = cookies();

    // 현재 프로젝트에서 사용하는 인증 쿠키 이름만 지정
    const authCookieNames = ["accessToken", "refreshToken"]; // 실제 사용하는 이름으로 변경

    const authCookies = authCookieNames
      .map((name) => {
        const cookie = cookieStore.get(name);
        return cookie ? `${cookie.name}=${cookie.value}` : null;
      })
      .filter(Boolean)
      .join("; ");

    if (authCookies) {
      headersToUse.set("Cookie", authCookies);
    }
  }

  const finalOptions = {
    ...fetchOptions,
    headers: headersToUse,
  };

  // 초기 요청
  let response = await fetch(target.url, finalOptions);

  if (!response.ok) {
    // body는 한 번만 읽을 수 있다. json()이 실패한 뒤 text()를 부르면 "Body is unusable"
    // TypeError가 새로 던져져 status가 사라진다 — 그러면 호출부의 401/403 분기가 못 잡고
    // 에러 화면 대신 영원한 로딩 폴백이 뜬다. 그래서 텍스트로 한 번 읽고 JSON은 그 위에서 시도한다.
    let errorData: unknown;
    try {
      const text = await response.text();
      try {
        errorData = JSON.parse(text);
      } catch {
        errorData = text;
      }
    } catch {
      errorData = null;
    }

    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    (error as any).status = response.status;
    (error as any).statusText = response.statusText;
    (error as any).data = errorData;

    throw error;
  }

  return response.json() as Promise<T>;
}
