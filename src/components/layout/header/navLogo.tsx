"use client";

import { useEffect, useRef, useState } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Bumang, Route53 } from "@/assets";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import { useTheme } from "next-themes";
import { useHeaderStore } from "@/store/header";

gsap.registerPlugin(ScrollTrigger);

const NavLogo = () => {
  const router = useRouter();
  const animState = useHeaderStore((state) => state.animState);
  const handleNavigate = () => {
    router.push("/");
  };

  /**
   * @Opacity
   */
  const handleSwitchVisibility = (type: "show" | "hide") => {
    gsap.to(".SUB", {
      opacity: type === "show" ? 1 : 0,
      stagger: 0.03,
      ease: "power1.inOut",
    });
  };

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const countDebouncingRef = useRef<NodeJS.Timeout | false>(false);
  const [resizeCountUp, setResizeCountUp] = useState(0);
  useEffect(() => {
    const handleResize = () => {
      // ✅ 기존 타이머가 있으면 취소
      if (countDebouncingRef.current) {
        clearTimeout(countDebouncingRef.current);
      }

      countDebouncingRef.current = setTimeout(() => {
        setResizeCountUp((prev) => prev + 1);
        countDebouncingRef.current = false;
        console.log("debounced!");
      }, 300);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      if (countDebouncingRef.current) {
        clearTimeout(countDebouncingRef.current);
      }
    };
  }, []);

  // 처음 숨기기 애니메이션 실행
  useEffect(() => {
    handleSwitchVisibility("hide");
  }, []);

  // 헤더 애니메이션 실행
  useEffect(() => {
    let scrollTrigger = null;

    const originalWidth = (window.innerWidth * 0.94) / 2;

    if (animState === "ANIM") {
      gsap.set(".BUMANG, .ROUTE53", { width: originalWidth });

      scrollTrigger = ScrollTrigger.create({
        trigger: ".LETTER_CONTAINER",
        start: "top top",
        end: "200px top",
        scrub: true,
        animation: gsap.to(".BUMANG, .ROUTE53", { width: 80 }),
      });
      // 새로고침 시 스크롤 상태를 반영
      ScrollTrigger.refresh();
    } else if (animState === "MIN") {
      gsap.set(".BUMANG, .ROUTE53", {
        width: 80,
      });
    } else if (animState === "MAX") {
      gsap.set(".BUMANG, .ROUTE53", { width: originalWidth });
    }

    return () => {
      scrollTrigger?.kill();
    };
    // eslint-disable-next-line
  }, [animState, resizeCountUp]);

  const headerBackgroundColor = useHeaderStore(
    (state) => state.backgroundColor,
  );

  const logoColor =
    mounted && resolvedTheme === "dark" ? "#ECE5E5" : "black";

  return (
    <div
      className={cn(
        "LETTER_CONTAINER top-0 grid w-full grid-cols-2 gap-[1.5vw] overflow-hidden px-[2vw] py-3 md:px-[6vw]",
        headerBackgroundColor,
      )}
      onMouseEnter={() => handleSwitchVisibility("show")}
      onMouseLeave={() => handleSwitchVisibility("hide")}
    >
      <div className="flex h-fit flex-1 items-center justify-start">
        <Bumang
          color={logoColor}
          className="BUMANG relative z-50 h-auto w-auto cursor-pointer"
          viewBox="0 0 802 140"
          preserveAspectRatio="xMinYMin meet"
          onClick={handleNavigate}
        />
      </div>
      <div className="flex h-fit flex-1 items-center justify-start">
        <Route53
          color={logoColor}
          className="ROUTE53 relative z-50 h-auto w-auto cursor-pointer"
          viewBox="0 0 802 140"
          preserveAspectRatio="xMinYMin meet"
          onClick={handleNavigate}
        />
      </div>
    </div>
  );
};

export default NavLogo;
