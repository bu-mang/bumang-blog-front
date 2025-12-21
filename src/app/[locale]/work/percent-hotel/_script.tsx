import type { WorkDetailConfig } from "@/types/work";
import bannerImage from "@/assets/works/compressed/percentHotel.webp";

import ph_2nd from "@/assets/workDetails/percentHotel/ph_2nd.jpg";
import ph_alarm_ios from "@/assets/workDetails/percentHotel/ph_alarm_ios.gif";
import ph_carousel from "@/assets/workDetails/percentHotel/ph_carousel.gif";
import ph_post_price from "@/assets/workDetails/percentHotel/ph_post_price.gif";
import ph_seo from "@/assets/workDetails/percentHotel/ph_seo.png";

export const SECTION_MAIN_PAGE = "SECTION_MAIN_PAGE";
export const SECTION_SELLER_REGISTER_PAGE = "SECTION_SELLER_REGISTER_PAGE";
export const SECTION_PUSH_NOTIFICATION_PAGE = "SECTION_PUSH_NOTIFICATION_PAGE";
export const SECTION_SEO = "SECTION_SEO";
export const SECTION_TEAM_LEADER = "SECTION_TEAM_LEADER";

const PERCENT_HOTEL_KO = {
  backToList: "목록으로 돌아가기",
  left: {
    badge: ["야놀자 테크 스쿨", "파이널 프로젝트", "종합 2위"],
    badgeStyles: ["semibold" as const, "normal" as const, "bold" as const],
    summary: {
      title: "프로젝트 요약",
      period: {
        label: "작업기간",
        value: "24.02.02. - 24.02.27.",
      },
      position: {
        label: "포지션",
        value: "프론트엔드",
      },
      techStack: {
        label: "테크스택",
        value: [
          { label: "React", colorClass: "bg-blue-100" },
          { label: "Vite", colorClass: "bg-yellow-100" },
          { label: "Zustand", colorClass: "bg-rose-100" },
          { label: "Styled Components", colorClass: "bg-pink-100" },
          { label: "PWA", colorClass: "bg-emerald-100" },
          { label: "Firebase Cloud Message(FCM)", colorClass: "bg-red-50" },
          { label: "Github Action", colorClass: "bg-slate-100" },
          { label: "MSW", colorClass: "bg-neutral-100" },
        ],
      },
      team: {
        label: "팀 구성",
        value: [
          { role: "프론트", amount: 5 },
          { role: "백엔드", amount: 5 },
          { role: "PM", amount: 4 },
          { role: "디자인", amount: 1 },
        ],
      },
      relatedLink: {
        label: "관련링크",
        value: [
          {
            name: "서비스",
            value: "https://percenthotel.web.app/",
            icon: "link" as const,
          },
          {
            name: "깃허브",
            value: "https://github.com/SCBJ-7/SCBJ-FE",
            icon: "github" as const,
          },
        ],
        testServiceAccount: {
          title: "테스트용 계정",
          email: "이메일",
          password: "비밀번호",
          idValue: "qwerty029369\n@naver.com",
          passwordValue: "qwerty123@",
        },
      },
    },
  },
  right: {
    title: "취소불가능한 매물을 양도 거래하세요!",
    desc: "이번 연휴에 가기로 한 여행.. 취소되셨다구요? 심지어 취소도 안 된다니.. 이럴 땐 퍼센트 호텔에서 경매에 붙이세요. 숙박 매물의 당근마켓! 사기매물과 과도한 리셀 프리미엄으로 인해 신뢰도가 낮았던 숙소 양도거래를 혁신합니다. 국내 최대 숙박 플랫폼 야놀자에서 인증된 상품만 취급하는 안전한 숙소 중고거래 플랫폼입니다.",
    navigation: {
      title: "맡은 역할",
      value: [
        {
          title: "메인 페이지",
          desc: "자체 캐로셀 개발",
          href: SECTION_MAIN_PAGE,
        },
        {
          title: "판매글작성 페이지",
          desc: "복잡한 비즈니스로직 예외처리",
          href: SECTION_SELLER_REGISTER_PAGE,
        },
        {
          title: "알림 페이지",
          desc: "FCM 알림 구현하기",
          href: SECTION_PUSH_NOTIFICATION_PAGE,
        },
        {
          title: "리액트 SEO 최적화",
          desc: "LightHouse SEO 점수 77점에서 100점으로",
          href: SECTION_SEO,
        },
        {
          title: "프론트엔드 팀장",
          desc: "팀 운영",
          href: SECTION_TEAM_LEADER,
        },
      ],
    },
  },
  details: [
    {
      title: "메인페이지",
      titleDesc: "자체 캐로셀 개발",
      id: SECTION_MAIN_PAGE,

      list: [
        {
          subtitle: "• 슬라이드 애니메이션 구현",
          desc: [
            "Resize 이벤트에 따라 부모 container의 width값이 변하면 슬라이드되는 x값도 변하도록 useCarouselSize 훅 개발",
            "MouseDown이벤트의 pageX 좌표값과 mouseUp 이벤트의 pageX 좌표값의 차이를 계산하여 delta(변화량)값을 도출. → 변화값이 일정 값 이상이면 다음 슬라이드로 이동하도록 구현",
            "useEffect와 SetInterval을 활용하여 3초 마다 무한반복 슬라이드 애니메이션 구현. MouseEnter, MouseLeave 이벤트를 감지하여 일시정지 구현. 클린업 함수로 페이지 이탈 시 setTimeout 해제하여 메모리 정리",
          ],
        },
        {
          subtitle: "• 모바일 환경과 PC 환경에 동일한 사용자 경험 제공",
          desc: [
            "캐로셀 애니메이션을 모바일, PC 환경에서 모두 드래그 가능하도록 TouchEvent와 MouseEvent를 모두 활용.",
            "touch이벤트 발생 시 mouse 이벤트를 cancel시켜 의도치 않은 클릭 방지",
          ],
        },
      ],

      image: ph_carousel,
    },
    {
      title: "판매글 작성 페이지",
      titleDesc: "복잡한 비즈니스 로직과 예외 처리",
      id: SECTION_SELLER_REGISTER_PAGE,

      list: [
        {
          subtitle: "• 복잡한 비즈니스 로직 예외처리를 커스텀 훅으로 핸들링",
          desc: [
            "양도 1차 가격, 2차 가격 설정 여부, 2차 가격 시간 설정, 2차 가격 설정, 계좌 등록 여부, 야놀자 인증 여부, 약관 동의 여부 등 다양한 비즈니스 로직들을 고려하여 다음 프로세스로 진행 가능한지 판별하는 커스텀 훅 개발",
          ],
        },
        {
          subtitle:
            "• 결제 수단이 없을 경우 결제수단등록 페이지로 리다이렉팅시킨 후 복귀 시 작성 상태 기록",
          desc: [
            "계좌 등록이 안 된 경우 현재까지의 작성 상태를 기억해놓고, 계좌 연결 플로우를 타게 한 다음 다시 복귀하는 로직이 필요",
            "현재 페이지에 머무르며 결제수단등록 페이지의 컴포넌트만 갈아끼워서 구현. 이로 인해 기존에 입력했던 state 모두 유지",
            "복귀 시 state는 살아있지만 브라우저에서 checkbox의 check상태가 풀려 있는 등의 문제가 발생 → 현재 state 상태에 따라 페이지 전환 시 다시 복구시키는 훅으로 대응 및 해결",
          ],
        },
      ],

      image: ph_post_price,
    },
    {
      title: "알림 페이지",
      titleDesc: "Firebase Cloud Message 알림 구현",
      id: SECTION_PUSH_NOTIFICATION_PAGE,

      list: [
        {
          subtitle: "• 안드로이드, iOS, PWA 내의 브라우저에서 푸시 알림 구현",
          desc: [
            "FCM 토큰 초기화 로직을 커스텀 훅으로 만들어 로그인 시 사용",
            "서비스 워커로 백그라운드 푸시 알림 수신",
            "백엔드에서 매물 거래 성공 혹은 체크인 7일, 1일 전 푸시알림 전송 시 프론트엔드에서 수신",
          ],
        },
      ],

      image: ph_alarm_ios,
    },
    {
      title: "리액트 SEO 최적화",
      titleDesc: "LightHouse SEO 최적화",
      id: SECTION_SEO,

      list: [
        {
          subtitle: "• React/Vite 환경에서도 서버사이드 pre-render 구현",
          desc: [
            "리액트 헬멧 라이브러리로 동적인 메타데이터를 브라우저에 렌더",
            "리액트 스냅 라이브러리로 리액트에서도 SSG 방식의 메타데이터 주입 구현",
            "개선 전 LightHouse SEO 점수 77점 → 100점",
          ],
        },
      ],

      image: ph_seo,
    },
    {
      title: "팀운영 및 전체 2등",
      titleDesc: "완성도와 팀워크를 가다듬어 파이널 프로젝트 2등 달성",
      id: SECTION_TEAM_LEADER,

      list: [
        {
          subtitle: "• 개발팀 규칙 설정",
          desc: [
            "매일 아침 데일리 스크럼으로 작업 내역 공유",
            "코드리뷰는 전원 다 해야 머지 가능. ‘수고하셨습니다.’보단 코드를 자세히 보면서 뭐라도 남기도록 유도.",
          ],
        },
        {
          subtitle: "• 프로젝트 중반 팀원 이탈 대처",
          desc: [
            "프로젝트 중반에 팀원 2명이 면접 준비를 이유로 중도 이탈하는 상황이 발생하여 남은 팀원들이 사기가 떨어지는 상황에 대한 대처",
            "이탈한 2명에게 연락하여 구체적으로 어떤 부분을 개발하고 있었고, 완료하지 못한 부분이 어디인지 파악하여 남은 인원들에게 업무 분담",
            "개발 템포가 떨어지지 않게 하기 위하여 오히려 코드리뷰를 더욱 자세히 하고, 빠른 피드백 문화를 위해 pr이 올라오면 3시간 이내에 확인하기 문화를 만듦. 그리고 잘한 점은 칭찬하는 문화를 전파.",
            "그 결과 팀원들 중 퍼포먼스가 가장 좋았던 팀원이 팀 분위기가 좋아 마지막까지 힘낼 수 있었다고 회고 때 언급",
          ],
        },
      ],

      image: ph_2nd,
    },
  ],
};

const PERCENT_HOTEL_EN = {
  backToList: "Back to List",
  left: {
    badge: ["Total", "2nd", "in", "Yanolja Tech School", "Graduate"],
    badgeStyles: [
      "normal" as const,
      "bold" as const,
      "normal" as const,
      "semibold" as const,
      "normal" as const,
    ],
    summary: {
      title: "Summary",
      period: {
        label: "Period",
        value: "24.02.02. - 24.02.27.",
      },
      position: {
        label: "Position",
        value: "Frontend",
      },
      techStack: {
        label: "Tech Stack",
        value: [
          { label: "React", colorClass: "bg-blue-100" },
          { label: "Vite", colorClass: "bg-yellow-100" },
          { label: "Zustand", colorClass: "bg-rose-100" },
          { label: "Styled Components", colorClass: "bg-pink-100" },
          { label: "PWA", colorClass: "" },
          { label: "Firebase Cloud Message(FCM)", colorClass: "bg-red-50" },
          { label: "Github Action", colorClass: "bg-slate-100" },
          { label: "MSW", colorClass: "bg-neutral-100" },
        ],
      },
      team: {
        label: "Team",
        value: [
          { role: "Front", amount: 5 },
          { role: "Back", amount: 5 },
          { role: "PM", amount: 4 },
          { role: "Design", amount: 1 },
        ],
      },
      relatedLink: {
        label: "Related Links",
        value: [
          {
            name: "Service",
            value: "https://percenthotel.web.app/",
            icon: "link" as const,
          },
          {
            name: "Github",
            value: "https://github.com/SCBJ-7/SCBJ-FE",
            icon: "github" as const,
          },
        ],
        testServiceAccount: {
          title: "Test Service Account",
          email: "Email",
          password: "Password",
          idValue: "qwerty029369\n@naver.com",
          passwordValue: "qwerty123@",
        },
      },
    },
  },
  right: {
    title: "Trade non-refundable accommodations!",
    desc: "Your vacation planned for this holiday... got cancelled? And you can't even cancel it? In times like this, put it up for auction on Percent Hotel. The Carrot Market for accommodations! We revolutionize accommodation transfer transactions that had low credibility due to fraudulent listings and excessive resale premiums. This is a safe accommodation resale platform that only handles products verified by Yanolja, Korea's largest accommodation platform.",
    navigation: {
      title: "Responsibilities",
      value: [
        {
          title: "Main Page",
          desc: "Custom carousel development",
          href: SECTION_MAIN_PAGE,
        },
        {
          title: "Seller Registration Page",
          desc: "Complex business logic exception handling",
          href: SECTION_SELLER_REGISTER_PAGE,
        },
        {
          title: "Notification Page",
          desc: "FCM notification implementation",
          href: SECTION_PUSH_NOTIFICATION_PAGE,
        },
        {
          title: "React SEO Optimization",
          desc: "LightHouse SEO score from 77 to 100 points",
          href: SECTION_SEO,
        },
        {
          title: "Frontend Team Leader",
          desc: "Team management",
          href: SECTION_TEAM_LEADER,
        },
      ],
    },
  },
  details: [
    {
      title: "Main Page",
      titleDesc: "Custom carousel development",
      id: SECTION_MAIN_PAGE,

      list: [
        {
          subtitle: "• Slide animation implementation",
          desc: [
            "Developed useCarouselSize hook so that when the width value of the parent container changes according to the Resize event, the sliding x value also changes",
            "Calculated the difference between the pageX coordinate value of the MouseDown event and the pageX coordinate value of the mouseUp event to derive the delta (change amount) value. → Implemented to move to the next slide when the change value exceeds a certain value",
            "Implemented infinite loop slide animation every 3 seconds using useEffect and SetInterval. Implemented pause by detecting MouseEnter and MouseLeave events. Memory cleanup by releasing setTimeout when leaving the page with cleanup function",
          ],
        },
        {
          subtitle:
            "• Providing the same user experience in mobile and PC environments",
          desc: [
            "Used both TouchEvent and MouseEvent to make carousel animation draggable in both mobile and PC environments.",
            "Canceled mouse events when touch events occur to prevent unintended clicks",
          ],
        },
      ],

      image: ph_carousel,
    },
    {
      title: "Seller Registration Page",
      titleDesc: "Complex business logic and exception handling",
      id: SECTION_SELLER_REGISTER_PAGE,

      list: [
        {
          subtitle:
            "• Handling complex business logic exceptions with custom hooks",
          desc: [
            "Developed custom hooks to determine whether it is possible to proceed to the next process by considering various business logics such as transfer 1st price, 2nd price setting status, 2nd price time setting, 2nd price setting, account registration status, Yanolja authentication status, terms agreement status, etc.",
          ],
        },
        {
          subtitle:
            "• Redirect to payment method registration page when there is no payment method, then record writing status upon return",
          desc: [
            "When account registration is not done, it was necessary to remember the current writing status, go through the account connection flow, and then return",
            "Implemented by staying on the current page and only replacing the component of the payment method registration page. This preserved all previously entered states",
            "Upon return, the state is alive but problems such as the browser's checkbox check status being unchecked occurred → Responded and resolved with a hook that restores according to the current state status when switching pages",
          ],
        },
      ],

      image: ph_post_price,
    },
    {
      title: "Notification Page",
      titleDesc: "Firebase Cloud Message notification implementation",
      id: SECTION_PUSH_NOTIFICATION_PAGE,

      list: [
        {
          subtitle:
            "• Implemented push notifications in Android, iOS, and PWA browsers",
          desc: [
            "Created FCM token initialization logic as a custom hook for use during login",
            "Background push notification reception through service worker",
            "Frontend receives push notifications when backend sends property transaction success or check-in 7 days, 1 day before push notifications",
          ],
        },
      ],

      image: ph_alarm_ios,
    },
    {
      title: "React SEO Optimization",
      titleDesc: "LightHouse SEO optimization",
      id: SECTION_SEO,

      list: [
        {
          subtitle:
            "• Implemented server-side pre-rendering even in React/Vite environment",
          desc: [
            "Rendered dynamic metadata to browser with React Helmet library",
            "Implemented SSG-style metadata injection in React with React Snap library",
            "LightHouse SEO score improved from 77 points → 100 points",
          ],
        },
      ],

      image: ph_seo,
    },
    {
      title: "Development Team Management",
      titleDesc:
        "Achieved 2nd place in final project by refining completeness and teamwork",
      id: SECTION_TEAM_LEADER,

      list: [
        {
          subtitle: "• Setting development team rules",
          desc: [
            "Shared work details through daily scrum every morning",
            "Code review must be done by everyone before merge is possible. Encouraged to look at code carefully and leave something rather than just saying 'Good work.'",
          ],
        },
        {
          subtitle:
            "• Dealing with team member departure in the middle of the project",
          desc: [
            "In the middle of the project, 2 team members left for interview preparation, which caused the remaining team members to lose morale",
            "Contacted the 2 departed members to understand what parts they were developing specifically and what parts were not completed, then distributed tasks among the remaining members",
            "To prevent the development tempo from dropping, made code reviews even more detailed and created a culture of checking PRs within 3 hours for quick feedback. Also spread a culture of praising good points.",
            "As a result, the team member with the best performance among the team members mentioned during retrospective that the good team atmosphere helped them stay motivated until the end",
          ],
        },
      ],

      image: ph_2nd,
    },
  ],
};

export const PERCENT_HOTEL_CONFIG: WorkDetailConfig = {
  title: "Percent Hotel",
  bannerImage,
  content: {
    ko: PERCENT_HOTEL_KO,
    en: PERCENT_HOTEL_EN,
  },
};
