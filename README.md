# Bumang Route53

개인 포트폴리오와 기술 블로그를 결합한 풀스택 웹 애플리케이션입니다.

🌐 **Live Site**: [www.bumang.xyz](https://www.bumang.xyz)

<img src="src/assets/works/bumangRoute53.png" alt="Bumang Route53 Preview" />

## 프로젝트 개요

Bumang Route53은 프론트엔드 개발자의 포트폴리오와 기술 블로그를 하나의 플랫폼에 통합한 웹사이트입니다. 블로그 글 작성 및 관리, 프로젝트 소개, 다국어 지원 등 다양한 기능을 제공합니다.

## 주요 기능

### 블로그 시스템

- 카테고리 및 태그 기반 글 분류 시스템
- 페이지네이션이 적용된 글 목록 (리스트/썸네일 뷰)
- 공개/비공개 글 관리
- BlockNote Editor를 활용한 풍부한 마크다운 편집 기능
- 댓글 시스템 (Utterances)

### 포트폴리오

- 프로젝트 상세 페이지
- 인터랙티브한 프로젝트 소개
- Play 섹션 (개인 작업물/갤러리)

### 기술적 특징

- **다국어 지원**: 한국어/영어 (next-intl)
- **인증 시스템**: JWT 기반 로그인
- **반응형 디자인**: 모바일/태블릿/데스크톱 대응
- **다크모드**: next-themes를 활용한 테마 전환
- **애니메이션**: GSAP, Framer Motion을 활용한 인터랙티브 UI
- **크롤러 차단**: Rate limiting을 통한 봇 트래픽 관리

## 기술 스택

### Core Framework

- **Next.js 14**: App Router, Server Components, Server Actions
- **React 18**: 최신 React 기능 활용
- **TypeScript**: 타입 안전성 보장

### Styling

- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Radix UI**: 접근성 높은 컴포넌트 라이브러리
- **Tailwind Animations**: 커스텀 애니메이션

### State Management & Data Fetching

- **Zustand**: 경량 상태 관리
- **TanStack Query (React Query)**: 서버 상태 관리
- **@suspensive/react**: Suspense 기반 선언적 비동기 처리
- **React Error Boundary**: 컴포넌트 단위 에러 핸들링
- **Axios**: HTTP 클라이언트

### Content Editor

- **BlockNote Editor**: 블로그 글 작성용 에디터
  - Accordion, Blockquote, Callout, Code
  - Image, Video, File Upload
  - Table, Embed, Link
  - Markdown 내보내기

### UI/UX Libraries

- **GSAP**: 고급 애니메이션
- **Lenis**: 부드러운 스크롤
- **Three.js**: 3D 그래픽 (인터랙티브 배경)
- **Lottie**: 애니메이션 파일 재생

### Form & Validation

- **React Hook Form**: 폼 상태 관리
- **Zod**: 스키마 기반 유효성 검사

### Internationalization

- **next-intl**: Next.js 다국어 지원

### Authentication

- **jose**: JWT 토큰 처리
- **jwt-decode**: JWT 디코딩

### Development Tools

- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **SVGR**: SVG를 React 컴포넌트로 변환

## 프로젝트 구조

```
bumang-blog-front/
├── src/
│   ├── app/                    # Next.js App Router
│   │   └── [locale]/          # 다국어 라우팅
│   │       ├── (home)/        # 홈페이지
│   │       ├── about/         # 소개 페이지
│   │       ├── blog/          # 블로그
│   │       │   ├── (list)/    # 글 목록
│   │       │   ├── [id]/      # 글 상세
│   │       │   └── edit/      # 글 작성/수정
│   │       ├── work/          # 포트폴리오/프로젝트
│   │       ├── play/          # 갤러리
│   │       └── login/         # 로그인
│   ├── components/
│   │   ├── common/            # 공통 컴포넌트
│   │   ├── layout/            # 레이아웃 (Header, Footer)
│   │   ├── modal/             # 모달
│   │   ├── pages/             # 페이지별 컴포넌트
│   │   ├── providers/         # Context Providers
│   │   └── ui/                # UI 컴포넌트 (Radix UI 기반)
│   ├── services/
│   │   ├── api/               # API 호출 함수
│   │   └── lib/               # HTTP 클라이언트 설정
│   ├── hooks/                 # 커스텀 훅
│   ├── store/                 # Zustand 스토어
│   ├── types/                 # TypeScript 타입 정의
│   ├── utils/                 # 유틸리티 함수
│   ├── constants/             # 상수
│   ├── i18n/                  # 다국어 설정
│   └── assets/                # 이미지, 폰트 등
├── public/                    # 정적 파일
├── src/middleware.ts         # Next.js Middleware (인증, Rate Limiting)
├── Dockerfile.prod           # 프로덕션 Docker 이미지 빌드 설정
└── next.config.mjs           # Next.js 설정
```

## 시작하기

### 사전 요구사항

- Node.js 20 이상
- npm 또는 yarn

### 설치 및 실행

1. 의존성 설치

```bash
npm install
```

2. 개발 서버 실행 (포트 4000)

```bash
npm run dev
```

3. 프로덕션 빌드

```bash
npm run build
```

4. 프로덕션 서버 실행

```bash
npm start
```

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
NEXT_PUBLIC_API_BASE_URL=https://<<SECRET-URL>>.com
NEXT_PUBLIC_S3_DOMAIN=<<SECRET-S3-BUCKETNAME>>.s3.region.amazonaws.com
```

## 배포

이 프로젝트는 **AWS EC2**에 **Docker** 컨테이너로 배포되며, **GitHub Actions**를 통해 자동 배포됩니다.

### 배포 아키텍처

- **인프라**: AWS EC2 (t4g.small, ARM64)
- **컨테이너화**: Docker (Multi-stage build)
- **CI/CD**: GitHub Actions
- **이미지 레지스트리**: Docker Hub
- **웹 서버**: Nginx (리버스 프록시)
- **SSL**: Let's Encrypt (Certbot)

### 배포 프로세스

1. **main 브랜치에 push** 시 GitHub Actions 워크플로우 자동 실행
2. **Docker 이미지 빌드**:
   - Multi-stage build로 최적화된 프로덕션 이미지 생성
   - 빌드 시 환경변수 (`NEXT_PUBLIC_*`) 주입
   - ARM64 플랫폼용 이미지 빌드
3. **Docker Hub에 푸시**: `bumang/bumang-blog-frontend:latest`
4. **EC2 배포**:
   - SSH로 EC2 접속
   - 최신 이미지 pull
   - docker-compose로 컨테이너 재시작
   - 자동 헬스체크 및 로그 확인

### 수동 배포

로컬에서 프로덕션 이미지를 빌드하려면:

```bash
docker build \
  -f Dockerfile.prod \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.bumang.xyz \
  --build-arg NEXT_PUBLIC_S3_DOMAIN=<<SECRET-S3-BUCKETNAME>>.s3.region.amazonaws.com \
  -t bumang-blog-frontend:latest \
  .
```

## 주요 페이지

- `/` - 홈페이지
- `/blog` - 블로그 글 목록
- `/blog/[id]` - 블로그 글 상세
- `/blog/edit` - 블로그 글 작성/수정 (인증 필요)
- `/work` - 포트폴리오 프로젝트 목록
- `/work/[project]` - 프로젝트 상세
- `/play` - 갤러리
- `/about` - 소개
- `/login` - 로그인

## 특징적인 구현

### 1. Next.js Middleware 기반 보안 및 인증 시스템

**Rate Limiting & 크롤러 관리** ([src/middleware.ts](src/middleware.ts))

- 악성 봇 차단: amazonbot, ahrefsbot, semrushbot 등 차단 목록 관리
- 검증된 봇 허용: Googlebot, Bingbot 등은 제한적 접근 허용 (1분 100회)
- IP 기반 Rate Limiting: 일반 사용자 1분 60회, 봇 1분 100회 제한
- User Agent 검증: 비정상적인 요청 차단
- 메모리 기반 요청 카운팅 (1000개 제한, 자동 정리)

**자동 토큰 갱신 시스템**

- Middleware에서 AccessToken 자동 검증
- AccessToken 만료 시 RefreshToken으로 자동 재발급
- 재발급 실패 시 쿠키 자동 정리 (클린업)
- 모든 요청에서 항상 fresh한 인증 상태 유지

### 2. 서버/클라이언트 하이브리드 아키텍처

**서버 컴포넌트 인증 처리**

- Middleware에서 검증된 AccessToken을 서버 컴포넌트에서 활용
- 쿠키 기반 인증 정보로 SSR 시 권한별 콘텐츠 제공
- 비공개 글, 초안 등 권한 기반 렌더링

**클라이언트 사이드 에러 핸들링**

- React Suspense를 활용한 로딩 상태 관리
- ErrorBoundary를 활용한 컴포넌트 단위 에러 처리
- UI 컴포넌트별 관심사 분리로 독립적인 에러 관리
- TanStack Query와 결합하여 선언적 데이터 페칭

### 3. 커스텀 에디터 통합

BlockNote Editor를 활용하여 블록 기반의 풍부한 텍스트 편집 기능을 제공합니다.

### 4. 서버/클라이언트 컴포넌트 분리

Next.js 14의 Server Components를 적극 활용하여 성능을 최적화했습니다.

### 5. 타입 안전성

TypeScript와 Zod를 활용하여 엔드-투-엔드 타입 안전성을 확보했습니다.

### 6. 인터랙티브 배경

Three.js를 활용한 3D 인터랙티브 배경 효과를 구현했습니다.

### 7. 접근성

Radix UI를 기반으로 ARIA 표준을 준수하는 접근성 높은 UI를 구현했습니다.

## 라이선스

이 프로젝트는 개인 포트폴리오 용도로 제작되었습니다.

## 문의

프로젝트에 대한 문의사항이 있으시면 [www.bumang.xyz](https://www.bumang.xyz)를 방문해주세요.
