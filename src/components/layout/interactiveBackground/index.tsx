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
  const pickRandomHomeItem = useBackgroundStore(
    (state) => state.home.pickRandomItem,
  );
  const bgColor = useBackgroundStore((state) => state.backgroundColor);

  // 홈 배경은 페이지를 새로 열 때마다 비율대로 뽑는다(백합 70% / 그림 30%).
  // 사이트 안에서 이동해 홈으로 돌아올 땐 다시 뽑지 않는다(스토어가 유지된다).
  useEffect(() => {
    pickRandomHomeItem();
  }, [pickRandomHomeItem]);

  // 페이지 귀속 배경
  const renderInteractiveBackground = () => {
    switch (pathname) {
      // INTERACTIVE
      case PATHNAME.WORK:
        return <WorkBackground />;
      case PATHNAME.HOME:
        if (process.env.NODE_ENV !== "production") return HomeBackgrounds[0]; // 개발 중인 백그라운드
        // 뽑기 전(서버 렌더링·첫 프레임)엔 기본 배경을 보여 준다.
        return homeSelectedIndex === null
          ? null
          : HomeBackgrounds[homeSelectedIndex];

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
