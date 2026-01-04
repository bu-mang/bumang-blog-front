import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { END_POINTS } from "./services";

const intlMiddleware = createMiddleware(routing);

// Rate Limiting을 위한 메모리 저장소
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// 차단할 봇 목록 (강화)
const blockedBots = [
  "amazonbot",
  "ahrefsbot",
  "semrushbot",
  "dotbot",
  "mj12bot",
  "blexbot",
  "serpstatbot",
  "python-requests",
  "curl/",
  "wget",
  "scrapy",
  "go-http-client",
  "axios/",
  "postman",
  "petalbot", // Huawei search
  "yandexbot", // Russian search
  "baiduspider", // Chinese search
  "bytespider", // TikTok
  "claudebot", // AI crawler
  "gptbot", // OpenAI crawler
  "anthropic-ai", // Anthropic
  "cohere-ai", // Cohere
  "bytedance", // ByteDance
  "meta-externalagent", // Meta AI
  "applebot-extended", // Apple AI training
  "ccbot", // Common Crawl
  "omgili", // Webhose
  "dataforseo", // DataForSEO
  "zoominfobot", // ZoomInfo
];

// 허용할 검증된 봇 (크롤링 속도 제한만 적용)
const verifiedBots = [
  "googlebot",
  "bingbot",
  "slurp",
  "duckduckbot",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
];

// Rate Limiting (사용 한도) 적용 함수
function applyRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): NextResponse | null {
  const now = Date.now();

  if (!requestCounts.has(key)) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs });
    return null;
  }

  const record = requestCounts.get(key)!;

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return null;
  }

  record.count++;

  if (record.count > limit) {
    console.log(
      `[RATE_LIMIT] Exceeded: ${key} (${record.count}/${limit} requests)`,
    );
    return new NextResponse("Too Many Requests. Please Try Later.", {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((record.resetTime - now) / 1000)),
      },
    });
  }

  // 90% 도달 시 경고 로그
  if (record.count === Math.floor(limit * 0.9)) {
    console.log(
      `[RATE_LIMIT] Warning: ${key} approaching limit (${record.count}/${limit})`,
    );
  }

  // 메모리 정리 (1000개 초과 시)
  if (requestCounts.size > 1000) {
    const cutoff = now - windowMs;
    for (const [k, v] of requestCounts.entries()) {
      if (v.resetTime < cutoff) {
        requestCounts.delete(k);
      }
    }
  }

  return null;
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 리소스는 Rate Limit 건너뛰기
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

  // CloudFront를 사용하는 경우 X-Forwarded-For에서 실제 클라이언트 IP 추출
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor
    ? forwardedFor.split(",")[0].trim() // 첫 번째 IP만 사용
    : request.ip || "unknown";

  const userAgent = request.headers.get("user-agent") || "";
  const userAgentLower = userAgent.toLowerCase();
  // 1. 악성 봇 차단
  const isBlockedBot = blockedBots.some((bot) => userAgentLower.includes(bot));

  if (isBlockedBot) {
    console.log(`[BLOCKED] Bot: ${userAgent} from ${ip}`);
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2. User Agent가 없거나 너무 짧으면 차단
  if (!userAgent || userAgent.length < 10) {
    console.log(`[BLOCKED] Suspicious: Empty/short UA from ${ip}`);
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 3. Rate Limiting 적용 (프로덕션 환경만)
  if (process.env.NODE_ENV === "production") {
    const isVerifiedBot = verifiedBots.some((bot) =>
      userAgentLower.includes(bot),
    );

    let rateLimitResponse: NextResponse | null;

    if (isVerifiedBot) {
      // 검증된 봇: 1분에 100회 (더 엄격하게)
      rateLimitResponse = applyRateLimit(ip, 100, 60000);
    } else {
      // 일반 사용자: 1분에 60회 (Netlify 사용량 초과 방지)
      rateLimitResponse = applyRateLimit(ip, 60, 60000);
    }

    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }

  // ------------------ 토큰 검증 ------------------

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  // 토큰이 있으면 검증하고 필요시 재발급
  if (accessToken || refreshToken) {
    try {
      // 액세스 토큰 검증 시도
      if (accessToken) {
        await jwtVerify(
          accessToken,
          new TextEncoder().encode(process.env.JWT_SECRET!),
        );
        // 토큰이 유효하면 그냥 진행
      }
    } catch (error) {
      // 액세스 토큰이 만료되었고 리프레시 토큰이 있으면 재발급 시도
      if (refreshToken) {
        try {
          // API 서버에서 토큰 재발급 요청
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

          const refreshResponse = await fetch(
            `${apiBaseUrl}${END_POINTS.POST_RENEW_ACCESS_TOKEN}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Cookie: `refreshToken=${refreshToken}`, // 리프레시 토큰을 쿠키로 전달
              },
              credentials: "include",
            },
          );

          if (refreshResponse.ok) {
            // Set-Cookie 헤더에서 새로운 accessToken 추출
            const setCookieHeader = refreshResponse.headers.get("set-cookie");

            if (setCookieHeader) {
              // next-intl 미들웨어 실행
              const response = intlMiddleware(request);

              // API 서버에서 받은 Set-Cookie 헤더를 그대로 전달
              response.headers.set("set-cookie", setCookieHeader);

              return response;
            } else {
              // Set-Cookie 헤더가 없으면 응답에서 직접 토큰 파싱 시도
              const data = await refreshResponse.json();

              if (data.accessToken) {
                const response = intlMiddleware(request);

                // 새 토큰을 쿠키에 설정
                response.cookies.set("accessToken", data.accessToken, {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === "production",
                  sameSite: "lax",
                  path: "/",
                  maxAge: 15 * 60, // 15분
                });

                return response;
              }
            }
          }

          // 토큰 재발급 실패 시 토큰들 삭제
          console.log("토큰 재발급 실패");
          const response = intlMiddleware(request);
          response.cookies.delete("accessToken");
          response.cookies.delete("refreshToken");
          return response;
        } catch (refreshError) {
          // 리프레시 토큰도 만료됐으면 토큰들 삭제하고 진행
          const response = intlMiddleware(request);
          response.cookies.delete("accessToken");
          response.cookies.delete("refreshToken");
          return response;
        }
      }
    }
  }

  // 토큰이 없거나 검증 완료 후 그대로 진행
  return intlMiddleware(request);
}

export const config = {
  // API 경로 제외하고 모든 경로에 적용
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
