"use client";

import { cn } from "@/utils/cn";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { PATHNAME } from "@/constants/routes/pathnameRoutes";
import { BackgroundItem, useBackgroundStore } from "@/store/background";
import { ButtonBase } from "@/components/common";

interface FooterBackgroundSelectProps {
  target: BackgroundItem;
  /** 마우스를 올린 점의 번호. 내리면 null(지금 배경 이름으로 돌아감). */
  onChangeIndicator: (v: number | null) => void;
}

export default function FooterBackgroundSelect({
  target,
  onChangeIndicator,
}: FooterBackgroundSelectProps) {
  const setSelectedItem = useBackgroundStore(
    (state) => state.home.setSelectedItem,
  );
  const selectedIndex = useBackgroundStore((state) => state.home.selectedIndex);

  return (
    <ButtonBase
      className={cn(
        "h-2 w-2 rounded-full bg-gray-5 transition hover:bg-gray-300",
        target[0] === selectedIndex && "border border-white bg-black",
      )}
      onMouseEnter={() => onChangeIndicator(target[0])}
      onMouseLeave={() => onChangeIndicator(null)}
      onClick={() => setSelectedItem(target[0])}
    />
  );
}
