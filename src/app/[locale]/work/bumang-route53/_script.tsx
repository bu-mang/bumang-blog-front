import type { WorkDetailConfig } from "@/types/work";
import bannerImage from "@/assets/works/compressed/bumangRoute53.webp";

import br_backend from "@/assets/workDetails/bumangRoute53/br_backend.png";
import br_userRole from "@/assets/workDetails/bumangRoute53/br_userRole.png";
import br_serverComponents from "@/assets/workDetails/bumangRoute53/br_serverComponents.png";
import br_headless from "@/assets/workDetails/bumangRoute53/br_headless.gif";
import br_darkmode from "@/assets/workDetails/bumangRoute53/br_darkmode.gif";

export const SECTION_BACKEND = "SECTION_BACKEND";
export const SECTION_RBAC = "SECTION_RBAC";
export const SECTION_REACT_COMP = "SECTION_REACT_COMP";
export const SECTION_SHADCN = "SECTION_SHADCN";
export const SECTION_UTILS = "SECTION_UTILS";

const BUMANG_ROUTE53_KO = {
  backToList: "목록으로 돌아가기",
  left: {
    badge: ["이 블로그", "풀스택으로", "만들었어요."],
    summary: {
      title: "프로젝트 요약",
      period: {
        label: "시작일",
        value: "2024.12. -",
      },
      position: {
        label: "포지션",
        value: "풀스택",
      },
      techStack: {
        label: "테크스택",
        value: [
          { label: "Next.js", colorClass: "bg-blue-100" },
          { label: "Tailwind", colorClass: "bg-neutral-100" },
          { label: "Next-intl(i18n)", colorClass: "bg-slate-100" },
          { label: "Gsap", colorClass: "bg-green-100" },
          { label: "Shadcn/ui", colorClass: "bg-slate-100" },
          { label: "Nest.js", colorClass: "bg-yellow-100" },
          { label: "TypeORM", colorClass: "bg-yellow-100" },
          { label: "Postgresql", colorClass: "bg-rose-100" },
          { label: "Docker/DockerCompose", colorClass: "bg-pink-100" },
          { label: "AWS EC2", colorClass: "bg-emerald-100" },
          { label: "AWS S3", colorClass: "bg-red-50" },
        ],
      },
      team: {
        label: "팀 구성",
        value: [{ role: "풀스택", amount: 1 }],
      },
      relatedLink: {
        label: "관련링크",
        value: [
          {
            name: "서비스",
            value: "https://www.bumang.xyz",
            icon: "link" as const,
          },
        ],
        testServiceAccount: {
          title: "테스트용 계정",
          email: "이메일",
          password: "비밀번호",
          idValue: "blog_user\n@gmail.com",
          passwordValue: "itsniceday250710",
        },
      },
    },
  },
  right: {
    title: "버망's 인터랙티브 포트폴리오 & 블로그",
    desc: "버망의 아티클과 그림 기록용 블로그입니다. ROUTE53인 이유가 혹시 궁금하신가요? 제 닉네임 옆에 길이가 비슷한 IT용어(특히 네트워크 용어)를 붙이고 싶었는데, 아마존의 도메인 서비스인 ROUTE53을 가져오기로 했습니다. 뭔가 있어보여서요. 테스트 아이디로 로그인한다면 직접 글을 써보실수도 있어요. 어차피 어드민(버망) 계정이 쓴 글이 아니면 24시간 안에 삭제될거지만요. 임시 아이디가 어딨냐구요?? 좌측 하단에 테스트용 아이디 있을테니 그걸로 로그인 해보세요.",
    navigation: {
      title: "맡은 역할",
      value: [
        {
          title: "블로그 백엔드 개발",
          desc: "Nest.js 개발부터 배포까지",
          href: SECTION_BACKEND,
        },
        {
          title: "역할 기반 접근 제어",
          desc: "역할을 차등하여 CRUD 권한 차별화",
          href: SECTION_RBAC,
        },
        {
          title: "React 서버/클라 컴포넌트 전략",
          desc: "SEO에 따른 서버/클라 패칭 분기",
          href: SECTION_REACT_COMP,
        },
        {
          title: "Headless UI 커스텀 컴포넌트",
          desc: "신속하게 고품질 컴포넌트 구축",
          href: SECTION_SHADCN,
        },
        {
          title: "i18n 및 다크모드",
          desc: "여러가지 유틸 기능 구현 및 실험",
          href: SECTION_UTILS,
        },
      ],
    },
  },
  details: [
    {
      title: "블로그 백엔드 개발",
      titleDesc: "Nest.js 개발부터 배포까지",
      id: SECTION_BACKEND,

      list: [
        {
          subtitle: "• 블로그 CRUD 기능 구현",
          desc: [
            "Postgresql을 활용한 관계형 DB 내 유저 - 포스트 - 카테고리 - 그룹 관계 설정",
            "점수 기반 관련성 알고리즘을 기반으로 관련 게시물 추천 API 개발",
            "블로그 편집 중 이미지를 삽입하거나, 썸네일 이미지로 등록하는 과정 구현. 버퍼가 큰 이미지는 클라이언트가 직접 S3로 업로드하도록 presigned URL을 제공.",
          ],
        },
        {
          subtitle: "• Docker 및 AWS EC2 배포를 위한 CI/CD 최적화",
          desc: [
            "Docker Compose를 사용하여 Nest.js 앱과 PostgreSQL 데이터베이스를 컨테이너화하고 Docker 이미지를 통해 배포",
            "GitHub Actions으로 자동 배포: EC2에 SSH 접속, 최신 Docker 이미지 pull, 컨테이너 재시작 등을 자동화",
            "배포 시 오래된 Docker 이미지 캐시 제거, 최신 3개 이미지만 유지하도록 설정",
          ],
        },
      ],

      image: br_backend,
    },
    {
      title: "역할 기반 접근 제어",
      titleDesc: "역할을 차등하여 CRUD 권한 차별화",
      id: SECTION_RBAC,

      list: [
        {
          subtitle: "• 퍼블릭, 유저, 어드민 등의 역할 분리",
          desc: [
            "운영자인 '어드민', 포스트 올리기 체험 및 일부 비공개글을 읽을 수 있는 '유저', 비로그인 상태인 '퍼블릭', 이렇게 3개의 권한이 존재",
            "퍼블릭 권한은 '유저Only' 포스트를 조회할 수 없고, 유저 권한은 '어드민Only' 포스트를 볼 수 없음.",
            "cron 스케줄링 작업으로 '어드민'이 올리지 않은 포스트는 24시간에 한 번 꼴로 삭제 정리됨.",
            "Guards와 커스텀 Decorators를 사용하여 인증 및 권한 부여 추상화",
          ],
        },
      ],

      image: br_userRole,
    },
    {
      title: "React 서버/클라 컴포넌트 전략",
      titleDesc: "SEO에 따른 서버/클라 패칭 분기",
      id: SECTION_REACT_COMP,

      list: [
        {
          subtitle:
            "• 인증/인가에 따라 서버컴포넌트와 클라이언트 컴포넌트의 관심사 분리",
          desc: [
            "SEO가 중요한 데이터(포스트 리스트, 내용 등)면서 public한 데이터는 서버 컴포넌트에서 처리.",
            "인증/인가가 필요한 데이터면 되도록 클라이언트 컴포넌트 내에서 httpOnly 쿠키와 함께 패칭하도록 유도.",
            "만약 비공개 글일 경우, 서버컴포넌트에서 토큰없이 호출 후 일차적으로 401에러가 반환되면, 클라이언트 컴포넌트에서 인증정보를 가지고 다시 패칭을 하는 구조 설정",
            "JWT 전략 상 엑세스토큰 주기를 짧게 설정하기 때문에, 토큰 만료 시 재발급 받아오는 과정이 필연적으로 필요함.",
            "그러나 서버컴포넌트에서 재발급 처리 시 httpOnly쿠키가 브라우저에 자동으로 심어지지 않음. (요청자가 브라우저가 아니기 때문) 그래서 서버사이드에서 다시 브라우저에 심어주는 과정이 필요.",
            "서버사이드에서 인증 관리 시 위와 같은 번거로움이 발생하므로 인증 관리는 클라이언트 컴포넌트에 일임. 관심사 분리 결정",
          ],
        },
      ],

      image: br_serverComponents,
    },
    {
      title: "Headless UI 커스텀 컴포넌트",
      titleDesc: "신속하게 고품질 컴포넌트 구축",
      id: SECTION_SHADCN,

      list: [
        {
          subtitle: "• Shadcn/ui, React-bits 등 여러 headless UI 활용",
          desc: [
            "풍부한 Shadcn HeadlessUI 생태계 활용",
            "기본적인 컬러, borderRadius, fontSize 규칙을 정해 디자인 통일성을 유지",
            "이 서비스에 필요한 복합적인 기능 컴포넌트도 헤드리스 UI들을 조합하여 합성하여 생성",
          ],
        },
      ],

      image: br_headless,
    },
    {
      title: "인터랙티브 아트 및 유틸 기능 구현",
      titleDesc: "사적인 기술 테스트베드",
      id: SECTION_UTILS,

      list: [
        {
          subtitle: "• i18n 및 다크모드 등 여러 유틸 기능들을 구현",
          desc: [
            "Three.js 및 Canvas를 이용한 배경들을 지속적 업데이트",
            "각종 인터랙티브 기능을 위한 CSS 기능 실험",
            "Next-intl으로 i18n 국제화 지원. 패스 라우팅 자체를 분기",
            "tailwind 디자인 토큰 기반 다크모드 전환 구현",
          ],
        },
      ],

      image: br_darkmode,
    },
  ],
};

const BUMANG_ROUTE53_EN = {
  backToList: "Back to List",
  left: {
    badge: ["This blog", "was built", "full-stack."],
    summary: {
      title: "Project Summary",
      period: {
        label: "Start Date",
        value: "2024.12. -",
      },
      position: {
        label: "Position",
        value: "Full-stack",
      },
      techStack: {
        label: "Tech Stack",
        value: [
          { label: "Next.js", colorClass: "bg-blue-100" },
          { label: "Tailwind", colorClass: "bg-neutral-100" },
          { label: "Next-intl(i18n)", colorClass: "bg-slate-100" },
          { label: "Gsap", colorClass: "bg-green-100" },
          { label: "Shadcn/ui", colorClass: "bg-slate-100" },
          { label: "Nest.js", colorClass: "bg-yellow-100" },
          { label: "TypeORM", colorClass: "bg-yellow-100" },
          { label: "Postgresql", colorClass: "bg-rose-100" },
          { label: "Docker/DockerCompose", colorClass: "bg-pink-100" },
          { label: "AWS EC2", colorClass: "" },
          { label: "AWS S3", colorClass: "bg-red-50" },
        ],
      },
      team: {
        label: "Team Size",
        value: [{ role: "Full-stack", amount: 1 }],
      },
      relatedLink: {
        label: "Related Links",
        value: [
          {
            name: "Service",
            value: "https://www.bumang.xyz",
            icon: "link" as const,
          },
        ],
        testServiceAccount: {
          title: "Test Account",
          email: "Email",
          password: "Password",
          idValue: "blog_user\n@gmail.com",
          passwordValue: "itsniceday250710",
        },
      },
    },
  },
  right: {
    title: "Bumang's Interactive Portfolio & Blog",
    desc: "This is Bumang's blog for recording articles and artwork. Wondering why it's called ROUTE53? I wanted to attach an IT term (especially a network term) of similar length next to my nickname, so I chose Amazon's domain service ROUTE53. It sounds professional. If you log in with the test account, you can even try writing posts yourself. Though any posts not written by the admin (Bumang) account will be deleted within 24 hours. Looking for the temporary account? Check the test account info at the bottom left.",
    navigation: {
      title: "Role & Responsibilities",
      value: [
        {
          title: "Blog Backend Development",
          desc: "From Nest.js development to deployment",
          href: SECTION_BACKEND,
        },
        {
          title: "Role-Based Access Control",
          desc: "Differentiated CRUD permissions by role",
          href: SECTION_RBAC,
        },
        {
          title: "React Server/Client Component Strategy",
          desc: "Server/Client fetching strategy for SEO",
          href: SECTION_REACT_COMP,
        },
        {
          title: "Headless UI Custom Components",
          desc: "Building high-quality components rapidly",
          href: SECTION_SHADCN,
        },
        {
          title: "i18n & Dark Mode",
          desc: "Implementation and experimentation of various utility features",
          href: SECTION_UTILS,
        },
      ],
    },
  },
  details: [
    {
      title: "Blog Backend Development",
      titleDesc: "From Nest.js development to deployment",
      id: SECTION_BACKEND,

      list: [
        {
          subtitle: "• Blog CRUD functionality implementation",
          desc: [
            "Set up relational database structure with PostgreSQL for User - Post - Category - Group relationships",
            "Developed related post recommendation API based on score-based relevance algorithm",
            "Implemented image insertion during blog editing and thumbnail registration. For large buffer images, provided presigned URLs for direct client-to-S3 upload.",
          ],
        },
        {
          subtitle: "• CI/CD optimization for Docker and AWS EC2 deployment",
          desc: [
            "Containerized Nest.js app and PostgreSQL database using Docker Compose, deployed via Docker images",
            "Automated deployment with GitHub Actions: SSH connection to EC2, pulling latest Docker images, container restart automation",
            "Configured deployment to remove old Docker image cache, maintaining only the latest 3 images",
          ],
        },
      ],

      image: br_backend,
    },
    {
      title: "Role-Based Access Control",
      titleDesc: "Differentiated CRUD permissions by role",
      id: SECTION_RBAC,

      list: [
        {
          subtitle: "• Separation of Public, User, and Admin roles",
          desc: [
            "Three permission levels exist: 'Admin' for operators, 'User' for post creation experience and accessing some private posts, and 'Public' for non-logged-in state",
            "Public users cannot view 'User Only' posts, and User users cannot see 'Admin Only' posts.",
            "Cron scheduling job deletes posts not created by 'Admin' once every 24 hours for cleanup.",
          ],
        },
      ],

      image: br_userRole,
    },
    {
      title: "React Server/Client Component Strategy",
      titleDesc: "Server/Client fetching strategy for SEO",
      id: SECTION_REACT_COMP,

      list: [
        {
          subtitle:
            "• Separation of concerns between server and client components based on authentication/authorization",
          desc: [
            "SEO-important and public data (post lists, content, etc.) is handled in server components.",
            "Data requiring authentication/authorization is fetched in client components with httpOnly cookies when possible.",
            "For private posts, server components make calls without tokens first, and if a 401 error is returned, client components refetch with authentication information",
            "Due to JWT strategy with short access token expiration, token refresh is inevitably required.",
            "However, when handling refresh in server components, httpOnly cookies are not automatically set in the browser (since the requester is not a browser). Manual cookie setting process is needed on the server side.",
            "Since server-side authentication management involves such complexities, authentication management is delegated to client components for separation of concerns",
          ],
        },
      ],

      image: br_serverComponents,
    },
    {
      title: "Headless UI Custom Components",
      titleDesc: "Building high-quality components rapidly",
      id: SECTION_SHADCN,

      list: [
        {
          subtitle:
            "• Utilizing various headless UIs including Shadcn/ui, React-bits",
          desc: [
            "Leveraged rich Tailwind-based HeadlessUI ecosystem",
            "Maintained design consistency by establishing basic color, borderRadius, and fontSize rules",
            "Created complex functional components needed for this service by composing and combining headless UI elements",
          ],
        },
      ],

      image: br_headless,
    },
    {
      title: "i18n & Dark Mode",
      titleDesc:
        "Implementation and experimentation of various utility features",
      id: SECTION_UTILS,

      list: [
        {
          subtitle:
            "• Implementation of various utility features including i18n and dark mode",
          desc: [
            "Continuous updates of backgrounds using Three.js and Canvas",
            "CSS feature experimentation for various interactive functionalities",
            "i18n internationalization support with Next-intl. Path routing branching itself",
            "Dark mode switching implementation based on Tailwind design tokens",
          ],
        },
      ],

      image: br_darkmode,
    },
  ],
};

export const BUMANG_ROUTE53_CONFIG: WorkDetailConfig = {
  title: "BUMANG ROUTE53",
  bannerImage,
  content: {
    ko: BUMANG_ROUTE53_KO,
    en: BUMANG_ROUTE53_EN,
  },
};
