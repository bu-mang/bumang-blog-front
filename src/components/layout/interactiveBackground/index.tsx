"use client";

import { PATHNAME } from "@/constants/routes/pathnameRoutes";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import { useEffect, useMemo } from "react";
import Ascii3DLily from "./ascii";
import HandDeepInside from "./handDeepInsde";
import WorkBackground from "./work";
import { useBackgroundStore } from "@/store/background";
import { useLenis } from "@/hooks/useLenis";

export default function InteractiveBackground() {
  // 부드러운 스크롤 애니메이션 init (/blog/edit은 제외)
  useLenis();

  const pathname = usePathname();

  const HomeBackgrounds = useMemo(
    () => [<Ascii3DLily key={0} />, <HandDeepInside key={1} />],
    [],
  );
  const homeSelectedIndex = useBackgroundStore(
    (state) => state.home.selectedIndex,
  );
  const bgColor = useBackgroundStore((state) => state.backgroundColor);

  // 페이지 귀속 배경
  const renderInteractiveBackground = () => {
    switch (pathname) {
      // INTERACTIVE
      case PATHNAME.WORK:
        return <WorkBackground />;
      case PATHNAME.HOME:
        return process.env.NODE_ENV === "production"
          ? HomeBackgrounds[homeSelectedIndex]
          : HomeBackgrounds[0]; // 개발 중인 백그라운드

      default:
        return null;
    }
  };

  // 기본 배경
  const renderStaticBackground = () => {
    return (
      <div
        className={cn(
          "fixed inset-0 -z-10 h-screen w-screen transition-all ease-in-out",
          bgColor,
        )}
      />
    );
  };

  return renderInteractiveBackground() || renderStaticBackground();
}
