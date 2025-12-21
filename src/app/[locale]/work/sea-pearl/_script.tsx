import type { WorkDetailConfig } from "@/types/work";
import bannerImage from "@/assets/works/compressed/seaPearl.webp";

import sp_start from "@/assets/workDetails/seaPearl/sp_start.webp";
import sp_ads from "@/assets/workDetails/seaPearl/sp_ads.gif";
import sp_virtual_list from "@/assets/workDetails/seaPearl/sp_virtual_list.png";
import sp_interactive from "@/assets/workDetails/seaPearl/sp_interactive.gif";
import sp_tab_caching from "@/assets/workDetails/seaPearl/sp_tab_caching.gif";

export const SECTION_WHOLE_PROCESS = "SECTION_WHOLE_PROCESS";
export const SECTION_IN_APP_ADS = "SECTION_IN_APP_ADS";
export const SECTION_VIRTUAL_LIST = "SECTION_VIRTUAL_LIST";
export const SECTION_TAPPING_OPTIMIZATION = "SECTION_TAPPING_OPTIMIZATION";
export const SECTION_TEAM_LEADER = "SECTION_TEAM_LEADER";

const SEA_PEARL_KO = {
  backToList: "목록으로 돌아가기",
  left: {
    badge: ["텔레그램 미니앱", "탭게임"],
    summary: {
      title: "프로젝트 요약",
      period: {
        label: "담당 시작일",
        value: "24.12.15.",
      },
      position: {
        label: "포지션",
        value: "프론트엔드 (텔레그램 웹뷰 미니앱 개발)",
      },
      techStack: {
        label: "테크스택",
        value: [
          { label: "React", colorClass: "bg-blue-100" },
          { label: "Vite", colorClass: "bg-yellow-100" },
          { label: "Zustand", colorClass: "bg-rose-100" },
          { label: "Telegram API", colorClass: "bg-neutral-100" },
          { label: "Tailwind", colorClass: "bg-blue-50" },
          { label: "React-Virtuoso", colorClass: "bg-emerald-100" },
          { label: "Suspensive", colorClass: "bg-slate-100" },
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
            name: "서비스",
            value: "https://t.me/sea_pearl_game_bot?start=hhuvfp7ea85T99ald3hv",
            icon: "link" as const,
          },
        ],
      },
    },
  },
  right: {
    title: "이번 주 래플 당첨자는...",
    desc: "Sea Pearl을 플레이하고 귀여운 수달 캐릭터로 펄을 수집하세요. 모은 펄들로 로터리를 응모하세요. 펄이 많이 있을수록 많은 복권을 구매할 수 있어요. 주간 래플에서 다음 USDT 당첨자가 되어보세요!",
    navigation: {
      title: "맡은 역할",
      value: [
        {
          title: "초기제품 전담",
          desc: "프론트엔드 개발환경 세팅부터 배포까지",
          href: SECTION_WHOLE_PROCESS,
        },
        {
          title: "인앱 광고 플랫폼 연동",
          desc: "Adsgram SDK 연동",
          href: SECTION_IN_APP_ADS,
        },
        {
          title: "가상 리스트 최적화",
          desc: "react-virtuoso를 사용하여 긴 목록도 최적화",
          href: SECTION_VIRTUAL_LIST,
        },
        {
          title: "탭게임 API호출 최적화",
          desc: "디바운스로 호출 횟수 최소화",
          href: SECTION_TAPPING_OPTIMIZATION,
        },
        {
          title: "인터랙티브 탭핑 애니메이션",
          desc: "미니앱 iframe 성능 한계 최적화",
          href: SECTION_TEAM_LEADER,
        },
      ],
    },
  },
  details: [
    {
      title: "초기제품 전담",
      titleDesc: "프론트엔드 개발환경 세팅부터 배포까지",
      id: SECTION_WHOLE_PROCESS,

      list: [
        {
          subtitle: "• 텔레그램 챗봇에 배포링크 및 테스트 서버링크 연동",
          desc: [
            "ngrok을 사용하여 로컬호스트 개발 환경을 텔레그램 챗봇에 연동 구축",
            "iframe 기반 미니 앱 환경 내에서 웹뷰로 프론트엔드 배포",
          ],
        },
        {
          subtitle: "• 텔레그램 API으로 유저 인증 처리",
          desc: [
            "텔레그램 미니 앱 글로벌 브라우저 API를 사용하여 사용자 인증 데이터를 가져오는 초기화 로직 구현",
            "텔레그램 유저 인증 기반으로 API 서버와 유저 고유값 식별하는 프로세스 구축",
          ],
        },
      ],

      image: sp_start,
    },
    {
      title: "인앱 광고 플랫폼 연동",
      titleDesc: "Adsgram SDK 연동",
      id: SECTION_IN_APP_ADS,

      list: [
        {
          subtitle: "• 인앱 광고를 위한 Adsgram SDK 설치",
          desc: [
            "Adsgram 서버로부터 성공/실패 결과를 받아 백엔드 API 서버로 전달하는 로직 구현",
            "사용자가 광고를 건너뛰거나, 앱을 백그라운드로 보내거나, 앱 관리자 화면에 머물러 있을 경우 광고 시청을 실패로 처리",
          ],
        },
      ],

      image: sp_ads,
    },
    {
      title: "가상 리스트 최적화",
      titleDesc: "리스트 가상 렌더",
      id: SECTION_VIRTUAL_LIST,

      list: [
        {
          subtitle: "• react-virtuoso를 사용하여 긴 목록도 최적화",
          desc: [
            "끝없이 추가될 수 있는 친구 리스트를 처리할 수 있도록 가상화된 리스트 구성",
            "뷰포트 이내에 올라와야지만 렌더될 수 있도록 처리하여 성능 개선",
          ],
        },
      ],

      image: sp_virtual_list,
    },
    {
      title: "탭게임 API호출 최적화",
      titleDesc: "디바운스로 호출 횟수 최소화",
      id: SECTION_TAPPING_OPTIMIZATION,

      list: [
        {
          subtitle:
            "• 어뷰징을 최대한 차단하며 동시에 호출비용을 줄이기 위한 방안 고안",
          desc: [
            "연속 탭핑 횟수를 디바운스로 집계하여 마지막 탭 후 3초 뒤 서버로 전송하도록 최적화",
            "사용자가 3초 이내에 화면을 나갈 경우, useEffect cleanup 함수를 사용하여 언마운트 전 서버 업데이트 보장",
          ],
        },
        {
          subtitle: "• 서버 비용과 보안의 트레이드 오프 논의",
          desc: [
            "디바운스 패턴으로 호출을 줄였지만, 탭핑 API를 좀 더 덜 호출할 수 있도록 캐싱을 활용하자는 비즈니스 요구가 들어옴.",
            "상태를 오래 유지하지 않고 바로 초기화시키는 것이 어뷰징을 막을 수 있는 방법이라 생각했지만 비즈니스 결정 요구에 따르기로 결정.",
            "탭 카운트를 persist되는 전역상태로 만들어 긴 텀으로 서버에 전송하도록 설정",
            "예상치 못한 종료 후에도 앱 재시작 시 캐싱되어있는 전역상태를 비우도록 설정",
            "서버에서 불러온 유저 재화와 캐싱된 재화를 합산하여 앱에 표출",
            "실제로 인앱 재화를 소비할 때는 캐싱된 재화를 먼저 서버에 반영하여 유저 입장에서 잔고가 충분해보이는데 결제되지않는 상황을 방어",
          ],
        },
      ],

      image: sp_tab_caching,
    },
    {
      title: "인터랙티브 애니메이션",
      titleDesc: "미니앱 iframe 성능 한계 최적화",
      id: SECTION_TEAM_LEADER,

      list: [
        {
          subtitle:
            "• 수달이 탭핑할 때 동적인 재화 획득 이펙트가 나오도록 설정",
          desc: [
            "재화 획득 시 스코어 이펙트에 기본 부스트 + 업그레이드 상황 + 부스트 여부를 반영하여 색상과 크기가 바뀌도록 설정",
            "랜덤을 반영한 점수 표출 애니메이션으로 탭핑 시 재미요소 추가",
            "탭할 때마다 문자열이 담길 수 있는 배열 안에 스코어 문자열을 마운트시킴. 이를 애니메이션으로 구현.",
            "오래 탭할 시 배열의 인자 갯수가 너무 많아져서 텔레그램 내 성능 한계 도달. 여러 테스트 후 배열 인자가 80개에 도달했을 시 빈 배열로 초기화하기로 결정.",
            "80번 연속 탭핑 후 81번 째의 이펙트가 잠시 빠르게 나오는 부정확함이 존재하지만, 그 후 또 80번은 자연스러운 연속적인 탭핑 애니메이션이 표출됨",
          ],
        },
        {
          subtitle: "• 동적인 룰렛 애니메이션",
          desc: [
            "룰렛판 구성은 서버에서 가져오는 정보. 룰렛판 구성이 동적으로 설정되게 만듦",
            "룰렛 애니메이션 시 translate3D, will-change 등 GPU 사용을 유도하는 속성들을 이용하여 부족한 성능을 보완.",
            "룰렛 실행 시 먼저 어떤 아이템이 당첨됐는지 서버에서 패칭해온 다음 애니메이션 시작.",
            "배열의 구성을 4배로 늘리고 4번째 배열에서 당첨 아이템이 룰렛판의 가운데에 오도록 설정. 트랜지션 애니메이션 속도를 마지막에 딜레이 되도록 유도.",
            "유저는 룰렛이 네바퀴 쯤 돌다가 내가 당첨된 아이템 앞에서 감속하여 멈추는 것으로 느끼게 됨.",
            "당첨 애니메이션으로 팡파레와 squisy한 모션의 모달이 표출되며 배열 상태 정상화",
          ],
        },
      ],

      image: sp_interactive,
    },
  ],
};

const SEA_PEARL_EN = {
  backToList: "Back to List",
  left: {
    badge: ["Telegram Mini App", "Tap Game"],
    summary: {
      title: "Project Summary",
      period: {
        label: "Start Date",
        value: "24.12.15.",
      },
      position: {
        label: "Position",
        value: "Frontend (Telegram WebView Mini App Development)",
      },
      techStack: {
        label: "Tech Stack",
        value: [
          { label: "React", colorClass: "bg-blue-100" },
          { label: "Vite", colorClass: "bg-yellow-100" },
          { label: "Zustand", colorClass: "bg-rose-100" },
          { label: "Telegram API", colorClass: "bg-neutral-100" },
          { label: "Tailwind", colorClass: "bg-blue-50" },
          { label: "React-Virtuoso", colorClass: "" },
          { label: "Suspensive", colorClass: "bg-slate-100" },
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
            name: "Service",
            value: "https://t.me/sea_pearl_game_bot?start=hhuvfp7ea85T99ald3hv",
            icon: "link" as const,
          },
        ],
      },
    },
  },
  right: {
    title: "This week's raffle winner is...",
    desc: "Play Sea Pearl and collect pearls with the cute otter character. Enter the lottery with your collected pearls. The more pearls you have, the more tickets you can purchase. Become the next USDT winner in the weekly raffle!",
    navigation: {
      title: "Responsibilities",
      value: [
        {
          title: "End-to-End Initial Product",
          desc: "From frontend development environment setup to deployment",
          href: SECTION_WHOLE_PROCESS,
        },
        {
          title: "In-App Ad Platform Integration",
          desc: "Adsgram SDK integration",
          href: SECTION_IN_APP_ADS,
        },
        {
          title: "Virtual List Optimization",
          desc: "Optimizing long lists using react-virtuoso",
          href: SECTION_VIRTUAL_LIST,
        },
        {
          title: "Tap Game API Call Optimization",
          desc: "Minimizing call frequency with debouncing",
          href: SECTION_TAPPING_OPTIMIZATION,
        },
        {
          title: "Interactive Tapping Animation",
          desc: "Optimizing mini-app iframe performance limitations",
          href: SECTION_TEAM_LEADER,
        },
      ],
    },
  },
  details: [
    {
      title: "End-to-End Initial Product",
      titleDesc: "From frontend development environment setup to deployment",
      id: SECTION_WHOLE_PROCESS,

      list: [
        {
          subtitle:
            "• Integrating deployment and test server links to Telegram chatbot",
          desc: [
            "Built integration between localhost development environment and Telegram chatbot using ngrok",
            "Deployed frontend as webview within iframe-based mini app environment",
          ],
        },
        {
          subtitle: "• User authentication handling with Telegram API",
          desc: [
            "Implemented initialization logic to retrieve user authentication data using Telegram mini app global browser API",
            "Built process to identify unique user values with API server based on Telegram user authentication",
          ],
        },
      ],

      image: sp_start,
    },
    {
      title: "In-App Ad Platform Integration",
      titleDesc: "Adsgram SDK integration",
      id: SECTION_IN_APP_ADS,

      list: [
        {
          subtitle: "• Installing Adsgram SDK for in-app advertising",
          desc: [
            "Implemented logic to receive success/failure results from Adsgram server and forward them to backend API server",
            "Handled ad viewing as failure when users skip ads, send app to background, or stay on app manager screen",
          ],
        },
      ],

      image: sp_ads,
    },
    {
      title: "Virtual List Optimization",
      titleDesc: "Virtual list rendering",
      id: SECTION_VIRTUAL_LIST,

      list: [
        {
          subtitle: "• Optimizing long lists using react-virtuoso",
          desc: [
            "Configured virtualized list to handle friends list that can be added indefinitely",
            "Improved performance by rendering only items within viewport",
          ],
        },
      ],

      image: sp_virtual_list,
    },
    {
      title: "Tap Game API Call Optimization",
      titleDesc: "Minimizing call frequency with debouncing",
      id: SECTION_TAPPING_OPTIMIZATION,

      list: [
        {
          subtitle:
            "• Devising solutions to minimize abuse while reducing API call costs",
          desc: [
            "Initial: Optimized by aggregating consecutive tap counts with debouncing and sending to server 3 seconds after last tap",
            "When users leave screen within 3 seconds, guaranteed server update before unmounting using useEffect cleanup function",
          ],
        },
        {
          subtitle: "• Trade-off discussion between server costs and security",
          desc: [
            "Although API calls were reduced with debouncing pattern, business requested using caching to further reduce tapping API calls",
            "Initially thought immediate state reset would prevent abuse, but decided to follow business requirements",
            "Made tap count a persisted global state to send to server in longer intervals",
            "Set to clear cached global state on app restart after unexpected termination",
            "Display sum of server-fetched user currency and cached currency in app",
            "When actually consuming in-app currency, cached currency is reflected to server first to prevent situations where users see sufficient balance but payment fails",
          ],
        },
      ],

      image: sp_tab_caching,
    },
    {
      title: "Interactive Animation",
      titleDesc: "Optimizing mini-app iframe performance limitations",
      id: SECTION_TEAM_LEADER,

      list: [
        {
          subtitle:
            "• Setting dynamic currency acquisition effects when otter taps",
          desc: [
            "Configured effects to change color and size based on basic boost + upgrade situation + boost status when acquiring currency",
            "Added fun element with path animations using random values during tapping",
            "Implemented appearance animation when adding score text string to array-based state",
            "Performance limits reached within Telegram when array had too many elements from long tapping. After testing, decided to reset to empty array when reaching 80 elements",
            "Some inaccuracy exists where 81st tap effect appears briefly fast after 80 consecutive taps, but natural continuous tapping animation displays for another 80 taps afterward",
          ],
        },
        {
          subtitle: "• Dynamic roulette animation",
          desc: [
            "Roulette configuration fetched from server. Made roulette configuration dynamically settable",
            "Used GPU-accelerating properties like translate3D and will-change to compensate for insufficient performance during roulette animation",
            "First fetched which item won from server before starting animation when executing roulette",
            "Expanded array configuration 4x and set winning item to center of roulette in 4th array. Induced transition animation speed to delay at the end",
            "Users perceive roulette spinning about 4 times then decelerating and stopping before their winning item",
            "Winning animation displays fanfare and squishy motion modal, then normalizes array state",
          ],
        },
      ],

      image: sp_interactive,
    },
  ],
};

export const SEA_PEARL_CONFIG: WorkDetailConfig = {
  title: "SEA PEARL",
  bannerImage,
  content: {
    ko: SEA_PEARL_KO,
    en: SEA_PEARL_EN,
  },
};
