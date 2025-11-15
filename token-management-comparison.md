# Next.js 토큰 관리 패턴 비교: Middleware vs BFF(API Proxy)

> 실전 프로젝트에서 마주친 두 가지 토큰 관리 패턴을 깊이 있게 비교 분석한다.

## 서론

현대 웹 애플리케이션에서 JWT 토큰 기반 인증은 사실상 표준이 되었다. 하지만 **"토큰을 어디서 어떻게 관리할 것인가"**는 여전히 논쟁의 여지가 있는 주제다.

특히 Next.js와 같은 풀스택 프레임워크에서는 다음과 같은 고민이 생긴다:

- 클라이언트 컴포넌트와 서버 컴포넌트에서 동일한 API를 호출할 때 토큰을 어떻게 관리할까?
- 토큰이 만료되었을 때 자동 재발급을 어떻게 구현할까?
- 보안을 유지하면서도 개발 편의성을 높이려면?

이 글에서는 실전 프로젝트에서 적용한 **Middleware 기반 토큰 관리**와 대안으로 자주 언급되는 **BFF(Backend For Frontend) 패턴**을 심층 비교한다.

---

## 패턴 1: Middleware 기반 토큰 관리

### 개념

Next.js Middleware를 활용하여 모든 요청을 가로채고, 토큰 검증 및 재발급을 처리하는 방식이다.

```
Client Request → Next.js Middleware → (토큰 검증/재발급) → Backend API
```

### 실제 구현

다음은 실제 프로젝트에서 사용 중인 middleware.ts 코드다:

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Rate Limiting (악성 봇 차단)
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "";

  // 악성 봇 차단
  const blockedBots = ["amazonbot", "ahrefsbot", "semrushbot"];
  if (blockedBots.some((bot) => userAgent.toLowerCase().includes(bot))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2. 토큰 검증 및 재발급
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (accessToken || refreshToken) {
    try {
      // 액세스 토큰 검증
      if (accessToken) {
        await jwtVerify(
          accessToken,
          new TextEncoder().encode(process.env.JWT_SECRET!)
        );
        // 유효하면 그대로 진행
      }
    } catch (error) {
      // 액세스 토큰 만료 시 리프레시 토큰으로 재발급
      if (refreshToken) {
        try {
          const apiBaseUrl = process.env.NODE_ENV === "production"
            ? process.env.NEXT_PUBLIC_API_BASE_URL
            : process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;

          const refreshResponse = await fetch(
            `${apiBaseUrl}/auth/refresh`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Cookie: `refreshToken=${refreshToken}`,
              },
              credentials: "include",
            }
          );

          if (refreshResponse.ok) {
            const setCookieHeader = refreshResponse.headers.get("set-cookie");

            if (setCookieHeader) {
              const response = intlMiddleware(request);
              response.headers.set("set-cookie", setCookieHeader);
              return response;
            }
          }

          // 재발급 실패 시 토큰 삭제
          const response = intlMiddleware(request);
          response.cookies.delete("accessToken");
          response.cookies.delete("refreshToken");
          return response;
        } catch (refreshError) {
          // 리프레시 토큰도 만료
          const response = intlMiddleware(request);
          response.cookies.delete("accessToken");
          response.cookies.delete("refreshToken");
          return response;
        }
      }
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

### 클라이언트 사용 예시

```typescript
// 클라이언트 컴포넌트
const fetchUserData = async () => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    credentials: 'include', // 쿠키 자동 전송
  });
  return response.json();
};
```

### 장점

✅ **낮은 레이턴시**: 클라이언트가 백엔드 API를 직접 호출하므로 빠름
✅ **간단한 구조**: 추가 레이어 없이 Middleware만으로 해결
✅ **서버 부하 적음**: 프록시 서버 없이 직접 통신
✅ **Rate Limiting 통합**: Middleware에서 봇 차단과 토큰 관리를 한 번에 처리

### 단점

❌ **토큰 노출 가능성**: 클라이언트가 쿠키를 통해 토큰에 접근 가능 (httpOnly로 완화 가능)
❌ **SSR/CSR 분리 관리**: 서버 컴포넌트와 클라이언트 컴포넌트에서 각각 처리 필요
❌ **CORS 이슈**: 별도 백엔드 API 호출 시 CORS 설정 필요

---

## 패턴 2: BFF(Backend For Frontend) 패턴

### 개념

Next.js API Routes를 중간 레이어로 사용하여 모든 API 호출을 프록시하고, 서버 측에서 토큰을 관리하는 방식이다.

```
Client → Next.js API Route (BFF) → Backend API
         ↓
         토큰 관리 + 데이터 변환
```

**중요**: BFF는 단순 프록시 역할만 한다. 실제 비즈니스 로직과 DB 접근은 Backend API에서 처리된다.

### 구현 예시

#### 1. BFF API Route 생성

```typescript
// app/api/proxy/[...path]/route.ts
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL;

// 토큰 재발급 함수
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refreshToken=${refreshToken}`,
      },
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return data.accessToken;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }
  return null;
}

// 유효한 토큰 가져오기
async function getValidToken(): Promise<string | null> {
  const cookieStore = cookies();
  let accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  // 액세스 토큰이 없고 리프레시 토큰이 있으면 재발급
  if (!accessToken && refreshToken) {
    accessToken = await refreshAccessToken(refreshToken);

    if (accessToken) {
      // 새 토큰을 쿠키에 저장
      cookieStore.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60, // 15분
      });
    }
  }

  return accessToken;
}

// GET 요청 핸들러
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const token = await getValidToken();

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 실제 백엔드 API 호출
  const apiPath = params.path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${BACKEND_URL}/${apiPath}${searchParams ? `?${searchParams}` : ''}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    // 선택적: 프론트엔드용 데이터 변환
    const transformed = {
      ...data,
      // 날짜 포맷팅, 불필요한 필드 제거 등
    };

    return NextResponse.json(transformed, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Backend API call failed' },
      { status: 500 }
    );
  }
}

// POST 요청 핸들러
export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const token = await getValidToken();

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiPath = params.path.join('/');
  const body = await request.json();

  try {
    const response = await fetch(`${BACKEND_URL}/${apiPath}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Backend API call failed' },
      { status: 500 }
    );
  }
}
```

#### 2. 클라이언트 사용

```typescript
// 클라이언트 컴포넌트
const fetchUserData = async () => {
  // BFF를 통해 호출 (토큰은 서버에서 자동 주입)
  const response = await fetch('/api/proxy/users/me');
  return response.json();
};

// 서버 컴포넌트
async function ServerComponent() {
  // 동일한 방식으로 호출 가능!
  const userData = await fetch('/api/proxy/users/me').then(r => r.json());

  return <div>{userData.name}</div>;
}
```

### 장점

✅ **토큰 완전 은닉**: 클라이언트는 토큰에 접근 불가 (최고 보안)
✅ **SSR/CSR 통일**: 서버/클라이언트 컴포넌트 모두 동일한 API 사용
✅ **중앙화된 관리**: 모든 API 호출을 한 곳에서 제어
✅ **데이터 변환 가능**: 백엔드 응답을 프론트엔드 포맷으로 가공
✅ **CORS 불필요**: 같은 도메인 내 통신

### 단점

❌ **레이턴시 증가**: 모든 요청이 Next.js 서버를 거쳐야 함 (약 2배)
❌ **서버 부하 증가**: Next.js 서버가 프록시 역할을 추가로 수행
❌ **복잡도 증가**: 추가 레이어 관리 필요
❌ **비용 증가**: 서버리스 환경에서 함수 실행 비용 2배

---

## 심층 비교 분석

### 1. 성능 비교

#### Middleware 방식
```
Client → Backend API
         ⏱️ 50ms
```

#### BFF 방식
```
Client → Next.js API → Backend API
         ⏱️ 30ms      ⏱️ 50ms
         = 총 80ms (60% 증가)
```

**결론**: Middleware 방식이 약 **30-40% 더 빠름**

### 2. 보안 비교

| 측면 | Middleware | BFF |
|------|-----------|-----|
| 토큰 노출 | httpOnly 쿠키 (클라이언트 접근 가능) | 서버만 접근 (완전 은닉) |
| XSS 공격 | httpOnly로 방어 | 완전 방어 |
| 토큰 탈취 시 피해 | 제한적 (짧은 만료 시간) | 더 안전 |
| 종합 평가 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**결론**: BFF가 보안상 더 유리하지만, Middleware도 **httpOnly + Secure 쿠키**로 충분히 안전

### 3. 확장성 비교

#### Middleware 방식
```typescript
// 새로운 API 추가 시
// 클라이언트에서 바로 호출 (추가 작업 없음)
fetch(`${API_BASE_URL}/new-endpoint`);
```

#### BFF 방식
```typescript
// 새로운 API 추가 시
// BFF 라우트는 자동으로 모든 경로 프록시 (추가 작업 없음)
fetch('/api/proxy/new-endpoint');
```

**결론**: 두 방식 모두 확장성 우수

### 4. 개발 복잡도

| 항목 | Middleware | BFF |
|------|-----------|-----|
| 초기 설정 | 간단 (1개 파일) | 복잡 (여러 라우트) |
| 유지보수 | 쉬움 | 보통 |
| 디버깅 | 쉬움 | 복잡 (레이어 추가) |
| 학습 곡선 | 낮음 | 중간 |

### 5. 비용 비교 (서버리스 환경)

**가정**: 월 100만 요청, Vercel Pro 플랜

#### Middleware 방식
- Edge Function: 무료 (100만 요청 포함)
- 외부 API 호출: 100만 회

#### BFF 방식
- Edge Function: 무료
- Serverless Function: 100만 회 (추가 비용 발생)
- 외부 API 호출: 100만 회

**결론**: BFF 방식이 **약 2배 비용 발생**

---

## 종합 비교표

| 기준 | Middleware | BFF | 승자 |
|------|-----------|-----|------|
| **성능** | 50ms | 80ms | Middleware |
| **보안** | 우수 (⭐⭐⭐⭐) | 최고 (⭐⭐⭐⭐⭐) | BFF |
| **서버 부하** | 낮음 | 높음 | Middleware |
| **개발 복잡도** | 낮음 | 중간 | Middleware |
| **SSR/CSR 통일** | 불가 | 가능 | BFF |
| **비용** | 낮음 | 높음 | Middleware |
| **확장성** | 우수 | 우수 | 동점 |
| **토큰 은닉** | 부분적 | 완전 | BFF |

---

## 실전 선택 가이드

### Middleware 방식을 선택해야 하는 경우

✅ **개인 블로그, 포트폴리오 사이트**
- 트래픽이 적고 비용 최적화가 중요한 경우
- 빠른 응답 속도가 필요한 경우

✅ **스타트업 MVP**
- 빠른 개발과 출시가 우선인 경우
- 초기 복잡도를 낮추고 싶은 경우

✅ **읽기 위주 서비스**
- 인증이 필요한 API가 적은 경우
- 공개 API가 대부분인 경우

### BFF 방식을 선택해야 하는 경우

✅ **금융, 헬스케어 등 보안이 중요한 서비스**
- 토큰 탈취 시 피해가 큰 경우
- 규제 준수가 필요한 경우

✅ **대규모 엔터프라이즈 애플리케이션**
- 여러 백엔드 API를 통합해야 하는 경우
- 데이터 변환 로직이 복잡한 경우

✅ **SSR/CSR 혼용이 많은 서비스**
- 서버 컴포넌트와 클라이언트 컴포넌트가 동일한 API를 자주 호출하는 경우

---

## 실제 프로젝트 적용 경험

### 내 블로그 프로젝트의 선택: Middleware

이 글에서 소개한 Middleware 방식을 선택한 이유:

1. **트래픽 규모**: 개인 블로그로 월 1만 방문자 수준
2. **비용 최적화**: 서버리스 함수 호출을 최소화하여 무료 티어 내 운영
3. **성능 우선**: 빠른 페이지 로딩이 사용자 경험에 중요
4. **간단한 구조**: 혼자 유지보수하기 쉬운 구조 선호

### 배운 점

1. **httpOnly + Secure 쿠키만으로도 충분히 안전**
   - XSS 공격 방어
   - CSRF 토큰 추가로 더 강화 가능

2. **Rate Limiting과 함께 사용하면 시너지**
   - Middleware에서 봇 차단 + 토큰 관리를 동시 처리
   - 악성 트래픽 사전 차단으로 서버 부하 감소

3. **프로덕션 환경에서만 엄격하게 적용**
   ```typescript
   if (process.env.NODE_ENV === "production") {
     // Rate Limiting 적용
   }
   ```
   - 개발 환경에서는 편의성 우선

### 만약 다시 선택한다면?

현재 규모에서는 **Middleware 방식을 다시 선택**할 것이다.

하지만 다음 상황이라면 BFF를 고려:
- 월 100만 방문자 이상
- 결제 시스템 추가
- 민감한 개인정보 처리 증가

---

## 결론

### 핵심 정리

1. **Middleware 패턴**
   - 빠르고, 간단하고, 비용 효율적
   - 중소규모 서비스에 적합

2. **BFF 패턴**
   - 안전하고, 통일되고, 유연함
   - 대규모 또는 보안 중요 서비스에 적합

### 최종 권장사항

```
프로젝트 규모 < 월 10만 방문자 → Middleware
프로젝트 규모 ≥ 월 10만 방문자 → BFF 고려

보안 요구사항 높음 → BFF
성능 최적화 우선 → Middleware

개발 리소스 부족 → Middleware
장기 유지보수 계획 → BFF
```

### 마치며

"완벽한 아키텍처"는 존재하지 않는다. 중요한 것은 **현재 프로젝트의 맥락에 맞는 선택**이다.

두 패턴 모두 장단점이 명확하므로, 이 글의 비교표를 참고하여 당신의 프로젝트에 가장 적합한 방식을 선택하길 바란다.

---

## 참고 자료

- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [BFF Pattern - Sam Newman](https://samnewman.io/patterns/architectural/bff/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**작성일**: 2025-11-12
**카테고리**: Backend, Next.js, Authentication
**태그**: #NextJS #JWT #TokenManagement #BFF #Middleware #Authentication
