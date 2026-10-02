import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { END_POINTS } from "./services";

const intlMiddleware = createMiddleware(routing);

// 여기서 하지 않는 것 두 가지:
// - 사용량 제한(rate limit): 백엔드의 전역 가드가 방문자 IP 기준으로 센다. 예전엔 이 파일이
//   메모리 Map으로 직접 셌는데, 프로세스가 재시작되면 초기화되고 페이지 요청만 셀 뿐
//   API를 직접 두드리는 요청은 막지 못했다.
// - 봇 차단: Cloudflare WAF 규칙(엣지)이 맡는다. 예전엔 여기서 User-Agent 목록으로
//   막았는데, 요청이 Node까지 온 뒤에야 걸러졌고 api 도메인은 덮지 못했다.

const AUTH_COOKIES = ["accessToken", "refreshToken"] as const;

// 만료 직전의 토큰으로 SSR을 시작하면 백엔드에 닿을 때쯤 만료돼 있을 수 있다. 여유를 둔다.
const EXPIRY_SKEW_MS = 10_000;

interface AccessClaims {
  role: string | null;
  expiresAt: number; // ms
}

/**
 * access 토큰의 내용을 읽는다. **서명은 검증하지 않는다.**
 *
 * 여기서 읽은 값은 "갱신이 필요한가", "로그인 페이지로 보낼까" 같은 빠른 판정에만 쓴다.
 * 위조한 토큰으로 이 판정을 통과해도 얻는 건 빈 화면뿐이다 — 데이터는 전부 백엔드가
 * 서명을 검증한 뒤에 내주고, 화면에 쓰는 사용자 정보도 백엔드에서 받아 온다
 * (getCurrentUser). 그래서 프론트는 서명 키(JWT_SECRET)를 갖지 않는다. 그 키는 검증뿐
 * 아니라 토큰 발급도 할 수 있는 키라, 백엔드 한 곳에만 있어야 한다.
 */
function readAccessClaims(token: string | undefined): AccessClaims | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const bytes = Uint8Array.from(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0),
    );
    const claims = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof claims.exp !== "number") return null;
    return {
      role: typeof claims.role === "string" ? claims.role : null,
      expiresAt: claims.exp * 1000,
    };
  } catch {
    return null;
  }
}

function isUsable(claims: AccessClaims | null): claims is AccessClaims {
  return !!claims && claims.expiresAt > Date.now() + EXPIRY_SKEW_MS;
}

/**
 * 백엔드에 access 토큰 재발급을 요청한다.
 *
 * 같은 호스트의 백엔드로 직행한다(API_INTERNAL_URL). 공개 주소로 부르면 옆 컨테이너에
 * 가려고 인터넷과 Cloudflare를 한 바퀴 돈다. 내부 경로에서는 방문자 IP를 헤더로 직접
 * 넘겨야 백엔드의 사용량 제한이 방문자별로 센다(안 넘기면 전부 이 서버 IP로 뭉친다).
 */
async function requestTokenRefresh(
  request: NextRequest,
  refreshToken: string,
): Promise<Response> {
  const internalUrl = process.env.API_INTERNAL_URL;
  const baseUrl = internalUrl || process.env.NEXT_PUBLIC_API_BASE_URL;

  const headers = new Headers({
    "Content-Type": "application/json",
    Cookie: `refreshToken=${refreshToken}`,
  });
  // cf-connecting-ip는 내부 경로로만 넘긴다 — Cloudflare를 다시 지나는 요청에 붙이면
  // 403으로 튕긴다(serverFetch의 같은 규칙 참고).
  const forwarded = internalUrl
    ? ["cf-connecting-ip", "x-forwarded-for", "user-agent"]
    : ["x-forwarded-for", "user-agent"];
  for (const name of forwarded) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  return fetch(`${baseUrl}${END_POINTS.POST_RENEW_ACCESS_TOKEN}`, {
    method: "POST",
    headers,
    cache: "no-store",
  });
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 리소스는 인증 처리를 건너뛴다
  const staticExtensions = [
    ".js",
    ".css",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".webp",
    ".mp4",
    ".webm",
  ];

  if (staticExtensions.some((ext) => pathname.endsWith(ext))) {
    return intlMiddleware(request);
  }

  // ------------------ access 토큰 갱신 ------------------
  // 보호 경로 판정보다 먼저 한다. 그래야 access 토큰이 만료됐어도 세션(refresh 토큰)이
  // 살아 있으면 /admin·/blog/edit가 로그인 페이지로 튕기지 않는다.
  //
  // 서버 쪽에서 토큰을 갱신하는 곳은 여기 하나다. 서버 컴포넌트는 쿠키를 쓸 수 없어서
  // 갱신을 할 수 없고, 그래서 페이지 요청이 서버 컴포넌트에 닿기 전에 여기서 끝내 둔다.
  // (브라우저가 API를 직접 부르다 만료를 만나는 경우는 axios 인터셉터가 맡는다.)
  const refreshToken = request.cookies.get("refreshToken")?.value;
  let claims = readAccessClaims(request.cookies.get("accessToken")?.value);

  // 백엔드가 내려준 Set-Cookie. 브라우저에 그대로 전달한다(재발급·삭제 공통).
  let setCookies: string[] = [];

  if (!isUsable(claims) && refreshToken) {
    // 갱신하지 못하면 이번 요청은 익명으로 그린다. 만료된 쿠키를 그대로 들고 서버
    // 컴포넌트로 넘어가면 백엔드가 "갱신하고 다시 오라"(401)로 답해 페이지가 깨진다.
    const proceedAsAnonymous = () => {
      for (const name of AUTH_COOKIES) request.cookies.delete(name);
      claims = null;
    };

    try {
      const refreshResponse = await requestTokenRefresh(request, refreshToken);

      if (refreshResponse.ok) {
        setCookies = refreshResponse.headers.getSetCookie();
        // 새 토큰을 지금 처리 중인 요청의 쿠키에도 바꿔 끼운다. 이게 없으면 이번 SSR은
        // 만료된 토큰으로 진행돼, 오랜만에 여는 첫 페이지가 로그아웃된 것처럼 그려진다.
        // next-intl 미들웨어가 request.headers를 복사해 넘기므로 서버 컴포넌트의
        // cookies()까지 그대로 전달된다.
        for (const cookie of setCookies) {
          const [pair] = cookie.split(";");
          const eq = pair.indexOf("=");
          const name = pair.slice(0, eq).trim();
          if ((AUTH_COOKIES as readonly string[]).includes(name)) {
            request.cookies.set(name, pair.slice(eq + 1));
          }
        }
        claims = readAccessClaims(request.cookies.get("accessToken")?.value);
      } else if (refreshResponse.status === 401) {
        // 백엔드가 세션을 명시적으로 거부했다(만료·로그아웃됨). 백엔드가 함께 보낸
        // 쿠키 삭제 지시를 브라우저에 전달한다. 삭제를 여기서 직접 만들지 않는 이유:
        // 쿠키는 발급할 때와 같은 Domain으로 지워야 하는데 그 값은 백엔드가 안다.
        setCookies = refreshResponse.headers.getSetCookie();
        proceedAsAnonymous();
      } else {
        // 500·502·503·429 등은 "세션이 무효"가 아니라 "서버에 문제가 있다"는 뜻이다.
        // 브라우저의 쿠키는 그대로 두고(배포 중 컨테이너 교체·nginx 재시작만으로
        // 로그아웃되지 않게) 이번 요청만 익명으로 진행한다.
        console.log(
          `토큰 재발급 실패(HTTP ${refreshResponse.status}) — 쿠키 유지, 이번 요청은 익명`,
        );
        proceedAsAnonymous();
      }
    } catch (refreshError) {
      // 연결 거부·타임아웃도 세션 무효가 아니다. 위와 같게 처리한다.
      console.log("토큰 재발급 요청 실패(네트워크) — 쿠키 유지", refreshError);
      proceedAsAnonymous();
    }
  }

  const finalize = (response: NextResponse) => {
    for (const cookie of setCookies) {
      response.headers.append("set-cookie", cookie);
    }
    return response;
  };

  // ------------------ 보호 경로 리다이렉트 ------------------
  // 화면 노출을 줄이기 위한 빠른 판정이다. 실제 경계는 백엔드 API 가드다.
  {
    const locale =
      pathname.match(/^\/(ko|en)(?=\/|$)/)?.[1] ?? routing.defaultLocale;
    const pathWithoutLocale = pathname.replace(/^\/(ko|en)(?=\/|$)/, "") || "/";
    const isAdminPath =
      pathWithoutLocale === "/admin" || pathWithoutLocale.startsWith("/admin/");
    const isEditPath =
      pathWithoutLocale === "/blog/edit" ||
      pathWithoutLocale.startsWith("/blog/edit");

    if (isAdminPath || isEditPath) {
      const role = isUsable(claims) ? claims.role : null;

      // 미인증 → 로그인으로
      if (!role) {
        return finalize(
          NextResponse.redirect(new URL(`/${locale}/login`, request.url)),
        );
      }
      // /admin은 host 전용 (그 외 역할은 홈으로)
      if (isAdminPath && role !== "host") {
        return finalize(
          NextResponse.redirect(new URL(`/${locale}`, request.url)),
        );
      }
      // /blog/edit는 인증된 사용자면 역할 무관 통과
    }
  }

  return finalize(intlMiddleware(request));
}

export const config = {
  // API 경로 제외하고 모든 경로에 적용
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
