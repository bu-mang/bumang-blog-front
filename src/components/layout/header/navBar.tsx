"use client";

import type { MenuType } from "@/types";
import { ROUTES } from "@/constants/routes/navBarRoutes";
import { cn } from "@/utils/cn";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link, usePathname } from "@/i18n/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { LuLanguages, LuMoonStar, LuAudioWaveform } from "react-icons/lu";
import { ButtonBase as Button, ButtonBase } from "@/components/common";
import { useMutation } from "@tanstack/react-query";
import { postLogout } from "@/services/api/auth/client";
import { useRouter } from "@/i18n/navigation";
import { useQueryParams } from "@/hooks/useQueryParams";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PATHNAME } from "@/constants/routes/pathnameRoutes";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "next-themes";
import { useHeaderStore } from "@/store/header";

gsap.registerPlugin(ScrollTrigger);

interface NavBarProps {
  isAuthenticated: boolean;
  locale: string;
  isLoading?: boolean;
  nickname?: string;
}

// TODO: 사분면 마다 코드스플리팅 할까..
const NavBar = ({
  isAuthenticated,
  locale,
  isLoading,
  nickname,
}: NavBarProps) => {
  const pathname = usePathname();
  const headerBackgroundColor = useHeaderStore(
    (state) => state.backgroundColor,
  );
  const headerBorderBottom = useHeaderStore((state) => state.borderBottom);

  /**
   * @HEADER_ANIMATION
   */
  const animState = useHeaderStore((state) => state.animState);
  const setAnimState = useHeaderStore((state) => state.setAnimState);
  useEffect(() => {
    // 애니메이션 실행 컨택스트를 만듦.
    const ctx = gsap.context(() => {
      if (animState === "ANIM") {
        gsap.to(".NAVBAR_CONTAINER", {
          y: -32,
          scrollTrigger: {
            start: "top top",
            end: "200px top",

            scrub: true,
            // markers: true,,
          },
        });
        gsap.to(".NAVBAR_BORDERBOX", {
          borderTopColor: "transparent",
          borderBottomColor: headerBorderBottom ?? "transparent", // "#ede5e5", text-gray-10
          scrollTrigger: {
            start: "top top",
            end: "200px top",

            scrub: true,
            // markers: true,,
          },
        });
        gsap.to(".NAVBAR_SWITCHING_PANEL", {
          x: 88,
          scrollTrigger: {
            start: "top top",
            end: "200px top",

            scrub: true,
            // markers: true,,
          },
        });
      } else if (animState === "MAX") {
        // 최대화일 때
        gsap.set(".NAVBAR_CONTAINER", { y: 0 });
        gsap.set(".NAVBAR_BORDERBOX", {
          borderTopColor: "#ede5e5",
          borderBottomColor: "white",
        });
        gsap.set(".NAVBAR_SWITCHING_PANEL", {
          x: 0,
        });
      } else if (animState === "MIN") {
        // 최소화일 때
        gsap.set(".NAVBAR_CONTAINER", { y: -32 });
        gsap.set(".NAVBAR_BORDERBOX", {
          borderTopColor: "transparent",
          borderBottomColor: headerBorderBottom ?? "transparent",
        });
        gsap.set(".NAVBAR_SWITCHING_PANEL", {
          x: 88,
        });
      }
    });

    return () => ctx.revert();
  }, [pathname, headerBorderBottom, animState]);

  const setUserAndIsAuthenticated = useAuthStore(
    (state) => state.setUserAndIsAuthenticated,
  );

  const logoutMutation = useMutation({
    mutationFn: postLogout,
    onSuccess: () => {
      window.location.href = PATHNAME.HOME; // full reload
      setUserAndIsAuthenticated({
        isAuthenticated: false,
        isAuthLoading: false,
        user: null,
      });
    },
  });
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (err) {
      console.log(err, "logged out Error");
    }
  };

  // ---------------- 제 2사분면 로직 ----------------

  /**
   * @PATHLOGIC
   */
  const paths = pathname.split("/").filter((item) => item !== "");
  const currentRoute = ROUTES.filter(
    (item) => item.sub !== undefined && item.url.startsWith(`/${paths[0]}`),
  )[0];

  /**
   * @LINKHOVERSTYLE
   */
  const { hasQueryValue, hasQuery } = useQueryParams();
  const linkHoverStyle =
    "relative z-50 transition-colors duration-300 ease-in-out text-gray-200 hover:text-black dark:hover:text-white cursor-pointer";
  const navStyleManager = (subItem: MenuType) => {
    return cn(
      linkHoverStyle,
      hasQueryValue("type", subItem.url) && "text-black dark:text-white",
      subItem.url === "all" &&
        !hasQuery("type") &&
        "text-black dark:text-white",
    );
  };

  // ---------------- 제 4사분면 로직 ----------------

  /**
   * @CLOCK_LOGIC
   */
  const [clock, setClock] = useState("00:00");
  useLayoutEffect(() => {
    const handleSetClock = () => {
      setClock((prevClock) => {
        let isAmPm = "am";
        let hours: number | string = new Date().getHours();

        if (hours >= 12) {
          hours = String(hours % 12).padStart(2, "0");
          isAmPm = "pm";
        } else if (hours === 0) {
          hours = 12;
        }

        let semiColon = ":";
        const isSemiColonNow = prevClock.includes(":");
        if (isSemiColonNow) semiColon = " ";

        const minutes = String(new Date().getMinutes()).padStart(2, "0");

        return `${hours}${semiColon}${minutes} ${isAmPm}`;
      });
    };

    const interval = setInterval(() => {
      handleSetClock();
    }, 1000);
    handleSetClock();

    return () => clearInterval(interval);
  }, []);

  /**
   * @SCREEN_WIDTH_HEIGHT_RESIZING
   */
  const [innerWidth, setInnerWidth] = useState(0);
  const [innerHeight, setInnerHeight] = useState(0);
  useLayoutEffect(() => {
    const handleResize = () => {
      setInnerWidth(window.innerWidth);
      setInnerHeight(window.innerHeight);

      if (window.innerWidth <= 768) {
        setAnimState("MAX");
      } else {
        setAnimState("ANIM");
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line
  }, []);

  /**
   * @CURRENT_TIMEZONE
   */
  const [currentTimeZone, setCurrentTimeZone] = useState("TZ");
  useEffect(() => {
    const resolvedTimeZone = Intl.DateTimeFormat()
      .resolvedOptions()
      .timeZone.split("/")[1];
    setCurrentTimeZone(resolvedTimeZone);
  }, []);
  /**
   * @CurrentOS
   */
  const [currentOs, setCurrentOs] = useState("OS");
  useEffect(() => {
    const userAgent = navigator?.userAgent;
    const targetOs =
      userAgent.match(
        /(Windows NT|Mac OS|Linux|Android|iPhone OS|iPad OS)/,
      )?.[0] || "Unknown";
    setCurrentOs(targetOs);
  }, []);

  // ---

  return (
    <div
      className={cn(
        "NAVBAR_CONTAINER relative w-full cursor-default font-medium",
        headerBackgroundColor,
      )}
    >
      {/* border-b-white */}
      <div className="NAVBAR_BORDERBOX mx-[2vw] grid grid-cols-2 gap-[1.5vw] border-b-[1px] border-t-[1px] border-b-transparent border-t-gray-10 py-1 pb-3 text-xs text-gray-200 md:mx-[6vw] md:grid-cols-4">
        {/* 1사분면 (로그인 / 인증 정보) */}
        <div className="NAVBAR_SWITCHING_PANEL relative hidden grid-cols-2 gap-[1.5vw] md:grid">
          {isAuthenticated ? (
            <div className="flex h-fit items-center gap-1.5">
              <Button className={linkHoverStyle}>{nickname}</Button>

              <div className="h-2 w-[1px] bg-gray-100" />

              <Button className="h-fit w-fit" onClick={handleLogout}>
                <span className={linkHoverStyle}>Logout</span>
              </Button>
            </div>
          ) : isLoading ? (
            <div className={linkHoverStyle}>loading...</div>
          ) : (
            <Link href="/login" className={linkHoverStyle}>
              Login
            </Link>
          )}
        </div>

        {/* 2사분면 (메뉴) */}
        <div className="grid grid-cols-2 gap-[1.5vw]">
          <div className="col-start-1 col-end-3">
            {/* MENU */}
            <div className="flex gap-1">
              {ROUTES.filter((item) => item.group === "NAVIGATOR").map(
                (item) => (
                  <Link
                    href={item.url}
                    key={item.title}
                    className={cn(
                      linkHoverStyle,
                      item.url.startsWith(`/${paths[0]}`) &&
                        "text-black dark:text-white",
                    )}
                    // onClick={(e) => {
                    //   e.preventDefault();
                    //   if (item.url === "/blog") {
                    //     window.location.href = "/blog"; // full reload
                    //   }
                    // }}
                  >
                    {item.title}
                  </Link>
                ),
              )}
            </div>

            {/* SUBMENU */}
            <div className="flex gap-1">
              {currentRoute?.sub?.map((subItem) => (
                <Link
                  key={subItem.title}
                  href={subItem?.parents?.[0] + "?type=" + subItem.url}
                  className={navStyleManager(subItem)}
                >
                  {subItem.title}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 3사분면 (아이콘) */}
        <div className="NAVBAR_SWITCHING_PANEL hidden grid-cols-2 gap-[1.5vw] md:grid">
          <div className="relative col-start-1 col-end-2 flex gap-1">
            <LocaleSwitcher
              locale={locale}
              className={cn(linkHoverStyle, "text-base")}
            />
            <ThemeSwitcher
              locale={locale}
              className={cn(linkHoverStyle, "text-base")}
            />
            <HeaderAnimSwitcher
              locale={locale}
              className={cn(linkHoverStyle, "text-base")}
            />{" "}
          </div>
        </div>

        {/* 4사분면 (타임존 / 해상도) */}
        <div className="grid gap-[1.5vw] md:grid-cols-2">
          <div className="grid gap-[1.5vw] whitespace-nowrap md:col-start-2 md:col-end-3 lg:grid-cols-2">
            <div className="absolute hidden flex-col lg:relative lg:flex">
              <span>{currentTimeZone}</span>
              <span>{clock}</span>
            </div>
            <div className="flex gap-1 whitespace-nowrap md:flex-col md:gap-0">
              <span className="">
                {innerWidth}x{innerHeight}
              </span>
              <span className="">{currentOs}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;

interface SwitcherProps {
  locale: string;
  className?: string;
}

function LocaleSwitcher({ locale, className }: SwitcherProps) {
  const pathname = usePathname();

  return (
    <Tooltip>
      <TooltipTrigger className="group relative h-fit w-fit" asChild>
        <Link href={pathname} locale={locale === "ko" ? "en" : "ko"}>
          <LuLanguages className={cn(className, "group-hover:text-black")} />
        </Link>
      </TooltipTrigger>

      <TooltipContent
        side="bottom"
        className="z-[1000] flex flex-col items-center gap-1"
      >
        <p className="text-[10px] text-gray-50 dark:text-gray-200">
          {locale === "ko" ? "언어" : "language"}
        </p>
        <div className="flex gap-2">
          <Link href={pathname} locale="ko">
            <p
              className={
                locale === "ko" ? "opacity-100" : "opacity-30 hover:opacity-100"
              }
            >
              Ko
            </p>
          </Link>
          <Link href={pathname} locale="en">
            <p
              className={
                locale === "en" ? "opacity-100" : "opacity-30 hover:opacity-100"
              }
            >
              En
            </p>
          </Link>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function ThemeSwitcher({ locale, className }: SwitcherProps) {
  const { theme, setTheme } = useTheme();

  const handleSwitchTheme = (state: "light" | "dark" | "system") => {
    setTheme(state);
  };

  return (
    <Tooltip>
      <TooltipTrigger className="group relative h-fit w-fit" asChild>
        <Button>
          <LuMoonStar className={cn(className, "group-hover:text-black")} />
        </Button>
      </TooltipTrigger>

      <TooltipContent
        side="bottom"
        className="z-[1000] flex flex-col items-center justify-center gap-0.5"
      >
        <p className="text-[10px] text-gray-50 dark:text-gray-200">
          {locale === "ko" ? "테마" : "Theme"}
        </p>
        <div className="flex gap-1">
          <ButtonBase
            className={cn(
              theme === "light"
                ? "opacity-100"
                : "opacity-30 hover:opacity-100",
            )}
            onClick={() => handleSwitchTheme("light")}
          >
            LIGHT
          </ButtonBase>
          <ButtonBase
            className={cn(
              theme === "dark" ? "opacity-100" : "opacity-30 hover:opacity-100",
            )}
            onClick={() => {
              handleSwitchTheme("dark");
            }}
          >
            DARK
          </ButtonBase>
          <ButtonBase
            className={cn(
              theme === "system"
                ? "opacity-100"
                : "opacity-30 hover:opacity-100",
            )}
            onClick={() => handleSwitchTheme("system")}
          >
            SYSTEM
          </ButtonBase>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function HeaderAnimSwitcher({ locale, className }: SwitcherProps) {
  const animState = useHeaderStore((state) => state.animState);
  const setAnimState = useHeaderStore((state) => state.setAnimState);

  const [canActivate, setCanActivate] = useState(true);

  const pathname = usePathname();
  useEffect(() => {
    switch (pathname) {
      case "/work":
      case "/work":
        setAnimState("ANIM");
        setCanActivate(false);
        break;

      default:
        setCanActivate(true);
        break;
    }
    // eslint-disable-next-line
  }, [pathname]);

  const handleSwitchAnim = (state: "ANIM" | "MIN" | "MAX") => {
    if (!canActivate) return;

    setAnimState(state);
  };

  const handleSwitchRotation = () => {
    if (!canActivate) return;
    let newAnimState: "ANIM" | "MIN" | "MAX" | null = null;
    switch (animState) {
      case "ANIM":
        newAnimState = "MAX";
        break;
      case "MAX":
        newAnimState = "MIN";
        break;
      case "MIN":
        newAnimState = "ANIM";
        break;
    }

    if (newAnimState) {
      setAnimState(newAnimState);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger className="group relative h-fit w-fit" asChild>
        <Button onClick={handleSwitchRotation}>
          <LuAudioWaveform
            className={cn(
              className,
              "group-hover:text-black",
              !canActivate && "opacity-30",
            )}
          />
        </Button>
      </TooltipTrigger>

      <TooltipContent
        side="bottom"
        className="z-[1000] flex flex-col items-center justify-center gap-0.5"
      >
        <p className="text-[10px] text-gray-50 dark:text-gray-200">
          {locale === "ko" ? "헤더" : "Header"}
        </p>
        {canActivate ? (
          <div className="flex gap-1">
            <ButtonBase
              className={cn(
                animState === "ANIM"
                  ? "opacity-100"
                  : "opacity-30 hover:opacity-100",
              )}
              onClick={() => handleSwitchAnim("ANIM")}
            >
              ANIM
            </ButtonBase>
            <ButtonBase
              className={cn(
                animState === "MAX"
                  ? "opacity-100"
                  : "opacity-30 hover:opacity-100",
              )}
              onClick={() => handleSwitchAnim("MAX")}
            >
              MAX
            </ButtonBase>
            <ButtonBase
              className={cn(
                animState === "MIN"
                  ? "opacity-100"
                  : "opacity-30 hover:opacity-100",
              )}
              onClick={() => handleSwitchAnim("MIN")}
            >
              MIN
            </ButtonBase>
          </div>
        ) : (
          <div className="max-w-24 break-keep text-center">
            {locale === "ko"
              ? "이 페이지에서는 header 설정을 변경할 수 없습니다."
              : "Header cannot be set in this Page."}
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
