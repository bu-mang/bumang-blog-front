import type { WorkDetailConfig } from "@/types/work";
import bannerImage from "@/assets/works/compressed/anttimeSwap.webp";

export const SECTION_SERVER_COMPONENT = "SECTION_SERVER_COMPONENT";
export const SECTION_SUSPENSE_ERROR_BOUNDARY =
  "SECTION_SUSPENSE_ERROR_BOUNDARY";
export const SECTION_WEB3 = "SECTION_WEB3";
export const SECTION_SCORE_ANIM = "SECTION_SCORE_ANIM";
export const SECTION_DEEPLINK_UPDATE = "SECTION_DEEPLINK_UPDATE";

const ANTTIME_SWAP_KO = {
  backToList: "목록으로 돌아가기",
  left: {
    badge: ["포인트 토큰 교환", "에어드롭", "플랫폼"],
    summary: {
      title: "프로젝트 요약",
      period: {
        label: "담당 시작일",
        value: "2024.06. -",
      },
      position: {
        label: "포지션",
        value: "프론트엔드",
      },
      techStack: {
        label: "테크스택",
        value: [
          { label: "Next.js", colorClass: "bg-gray-10" },
          { label: "Tailwind", colorClass: "bg-blue-50" },
          { label: "WAGMI", colorClass: "bg-emerald-50" },
          { label: "Gsap", colorClass: "bg-green-50" },
          { label: "Zustand", colorClass: "bg-rose-100" },
          { label: "Tanstack Query", colorClass: "bg-orange-50" },
          { label: "Github Action", colorClass: "bg-slate-100" },
          { label: "Firebase Auth", colorClass: "bg-yellow-100" },
          { label: "Firebase Hosting", colorClass: "bg-yellow-100" },
          {
            label: "Suspensive",
            colorClass: "bg-blue-50",
          },
        ],
      },
      team: {
        label: "팀 구성",
        value: [
          { role: "프론트", amount: 1 },
          { role: "백엔드", amount: 1 },
          { role: "PM", amount: 1 },
          { role: "디자인", amount: 1 },
        ],
      },
      relatedLink: {
        label: "관련링크",
        value: [
          {
            name: "공식",
            value: "https://anttime-exchange.web.app/",
            icon: "link" as const,
          },
        ],
      },
    },
  },
  right: {
    title: "Time 2 TokenSwap!",
    desc: "ANTTIME에서 쌓은 타임포인트를 ANT TOKEN으로 전환하세요. 토큰 전환량은 커뮤니티 기여도(채굴시간, 친구 초대 수) 및 어뷰징 여부를 반영하여 계산합니다. 내 점수를 조회해서 토큰 전환을 얼마할지 정해보세요.",
    navigation: {
      title: "맡은 역할",
      value: [
        {
          title: "서버/클라이언트 컴포넌트 전략",
          desc: "SEO, 보안 여부를 고려",
          href: SECTION_SERVER_COMPONENT,
        },
        {
          title: "React18 Suspense 패턴",
          desc: "로딩/성공/에러 상태 컴포넌트 별 분리", // Lottie 플레이어 기반 애니메이션을 React-native-reanimated를 통한 타임라인 애니메이션으로 전환"
          href: SECTION_SUSPENSE_ERROR_BOUNDARY,
        },
        {
          title: "Web3 지갑 트랜잭션",
          desc: "WAGMI를 사용한 Web3 지갑 연결 및 트랜잭션",
          href: SECTION_WEB3,
        },
        {
          title: "스코어 카운팅 애니메이션",
          desc: "GSAP을 활용한 복잡한 순차적 타이밍 애니메이션 구현",
          href: SECTION_SCORE_ANIM,
        },
      ],
    },
  },
  details: [
    {
      title: "서버/클라이언트 컴포넌트 전략",
      titleDesc: "SEO, 보안 여부를 고려",
      id: SECTION_SERVER_COMPONENT,

      list: [
        {
          subtitle: "• SEO 필요 여부에 따른 서버사이드 활용",
          desc: [
            "SEO에 민감한 데이터는 서버 컴포넌트에서 가져와 프리 렌더링",
            "시기 별, 유저 권한 별 접근 가능 여부를 서버 컴포넌트에서 판단하여 브라우저에 노출시키지 않음",
          ],
        },
      ],

      image: "",
    },
    {
      title: "React18 Suspense 패턴",
      titleDesc: "로딩/성공/에러 상태 컴포넌트 별 분리",
      id: SECTION_SUSPENSE_ERROR_BOUNDARY,

      list: [
        {
          subtitle: "• Tanstack Query의 useSuspenseQuery와의 조합 활용",
          desc: [
            "Suspense로 Promise를 캐치하여 스켈레톤 및 로딩 컴포넌트를 표출. Error Boundary에 에러 컴포넌트를 물려 상태 별 컴포넌트가 분리되도록 유도.",
            "순차적인 데이터 패칭이 필요한 경우 컴포넌트 레이어를 차등하여 Suspense 패턴 유지",
            "클라이언트 사이드 내에서 패칭 보장이 필요한 요청의 경우, Suspensive 라이브러리의 ClientOnly 옵션 사용",
          ],
        },
      ],

      image: "",
    },
    {
      title: "Web3 지갑 트랜잭션",
      titleDesc: "WAGMI를 사용한 Web3 지갑 연결 및 트랜잭션",
      id: SECTION_WEB3,

      list: [
        {
          subtitle: "• 토큰스왑 신청 및 수령 과정에서 Web3 지갑 사용",
          desc: [
            "MetaMask와 WalletConnect 등 주요 지갑 연결 및 사용자 정보 가져오기",
            "서버에서 유저의 토큰 신청량, 머클프루프 등을 받아 트랜잭션 발생",
            "이더스캔에서 성공 여부를 스캔할 수 있도록 유도.",
          ],
        },
      ],

      image: "",
    },
    {
      title: "스코어 카운팅 애니메이션",
      titleDesc: "GSAP을 활용한 복잡한 순차적 타이밍 애니메이션 구현",
      id: SECTION_SCORE_ANIM,

      list: [
        {
          subtitle:
            "• useContext를 사용하여 컴포넌트 간 애니메이션 타이밍 상태 공유",
          desc: [
            "React-Bits, React-Slot-Counter 등 리액트 기반 동적인 애니메이션 라이브러리 적극 활용",
            "유저가 자신의 스코어가 올라가는 과정을 동적인 애니메이션으로 체험할 수 있도록 유도",
          ],
        },
      ],

      image: "",
    },
  ],
};

const ANTTIME_SWAP_EN = {
  backToList: "Back to List",
  left: {
    badge: ["Point Token Exchange", "Airdrop", "Platform"],
    summary: {
      title: "Project Summary",
      period: {
        label: "Start Date",
        value: "2024.06. -",
      },
      position: {
        label: "Position",
        value: "Frontend",
      },
      techStack: {
        label: "Tech Stack",
        value: [
          { label: "Next.js", colorClass: "bg-gray-10" },
          { label: "Tailwind", colorClass: "bg-blue-50" },
          { label: "WAGMI", colorClass: "" },
          { label: "Gsap", colorClass: "bg-green-50" },
          { label: "Zustand", colorClass: "bg-rose-100" },
          { label: "Tanstack Query", colorClass: "bg-orange-50" },
          { label: "Github Action", colorClass: "bg-slate-100" },
          { label: "Firebase Auth", colorClass: "bg-yellow-100" },
          { label: "Firebase Hosting", colorClass: "bg-yellow-100" },
          {
            label: "Suspensive",
            colorClass: "bg-blue-50",
          },
        ],
      },
      team: {
        label: "Team Composition",
        value: [
          { role: "Frontend", amount: 1 },
          { role: "Backend", amount: 1 },
          { role: "PM", amount: 1 },
          { role: "Design", amount: 1 },
        ],
      },
      relatedLink: {
        label: "Related Links",
        value: [
          {
            name: "Official",
            value: "https://anttime-exchange.web.app/",
            icon: "link" as const,
          },
        ],
      },
    },
  },
  right: {
    title: "Time 2 TokenSwap!",
    desc: "Convert your accumulated time points from ANTTIME to ANT TOKEN. The token conversion amount is calculated based on community contribution (mining time, friend invitations) and abuse detection. Check your score to decide how much token conversion to make.",
    navigation: {
      title: "Responsibilities",
      value: [
        {
          title: "Server/Client Component Strategy",
          desc: "Considering SEO and security requirements",
          href: SECTION_SERVER_COMPONENT,
        },
        {
          title: "React18 Suspense Pattern",
          desc: "Separating loading/success/error state components",
          href: SECTION_SUSPENSE_ERROR_BOUNDARY,
        },
        {
          title: "Web3 Wallet Transactions",
          desc: "Web3 wallet connection and transactions using WAGMI",
          href: SECTION_WEB3,
        },
        {
          title: "Score Counting Animation",
          desc: "Complex sequential timing animations using GSAP",
          href: SECTION_SCORE_ANIM,
        },
      ],
    },
  },
  details: [
    {
      title: "Server/Client Component Strategy",
      titleDesc: "Considering SEO and security requirements",
      id: SECTION_SERVER_COMPONENT,

      list: [
        {
          subtitle: "• Utilizing server-side based on SEO requirements",
          desc: [
            "Pre-rendering SEO-sensitive data fetched in server components",
            "Determining access permissions by time period and user authority in server components to avoid browser exposure",
          ],
        },
      ],

      image: "",
    },
    {
      title: "React18 Suspense Pattern",
      titleDesc: "Separating loading/success/error state components",
      id: SECTION_SUSPENSE_ERROR_BOUNDARY,

      list: [
        {
          subtitle:
            "• Utilizing combination with Tanstack Query's useSuspenseQuery",
          desc: [
            "Catching Promises with Suspense to display skeleton and loading components. Passing error components to Error Boundary to separate state-specific components.",
            "Maintaining Suspense pattern by differentiating component layers when sequential data fetching is required",
            "Using Suspensive library's ClientOnly option for requests that need guaranteed fetching within client-side",
          ],
        },
      ],

      image: "",
    },
    {
      title: "Web3 Wallet Transactions",
      titleDesc: "Web3 wallet connection and transactions using WAGMI",
      id: SECTION_WEB3,

      list: [
        {
          subtitle:
            "• Using Web3 wallets in token swap application and receipt process",
          desc: [
            "Connecting major wallets like MetaMask and WalletConnect and retrieving user information",
            "Receiving user's token application amount and Merkle proof from server to generate transactions",
            "Guiding users to scan success status on Etherscan.",
          ],
        },
      ],

      image: "",
    },
    {
      title: "Score Counting Animation",
      titleDesc: "Complex sequential timing animations using GSAP",
      id: SECTION_SCORE_ANIM,

      list: [
        {
          subtitle:
            "• Sharing animation timing state between components using useContext",
          desc: [
            "Actively utilizing React-based dynamic animation libraries like React-Bits and React-Slot-Counter",
            "Enabling users to experience their score increase process through dynamic animations",
          ],
        },
      ],

      image: "",
    },
  ],
};

export const ANTTIME_SWAP_CONFIG: WorkDetailConfig = {
  title: "ANTTIME SWAP",
  bannerImage,
  content: {
    ko: ANTTIME_SWAP_KO,
    en: ANTTIME_SWAP_EN,
  },
};
