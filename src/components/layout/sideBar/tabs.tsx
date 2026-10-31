"use client";

import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import { usePathname } from "@/i18n/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useQueryParams } from "@/hooks/useQueryParams";

const Tabs = () => {
  /**
   * TAB INDICATOR 스타일
   */
  const { getQueryValue, hasQuery, hasQueryValue, updateQuery } =
    useQueryParams();
  const getTabStyle = (target: string) =>
    cn(
      "text-xl text-gray-300 font-medium",
      hasQueryValue("type", target) && "text-black dark:text-white",
      target === "all" && !hasQuery("type") && "text-black dark:text-white",
    );

  /**
   * TAB INDICATOR 애니메이션 로직
   */
  const [indicatorX, setIndicatorX] = useState(0);
  const [indicatorWidth, setIndicatorWidth] = useState(0);
  const allRef = useRef<HTMLAnchorElement | null>(null);
  const devRef = useRef<HTMLAnchorElement | null>(null);
  const lifeRef = useRef<HTMLAnchorElement | null>(null);
  const typeValue = getQueryValue("type");

  useLayoutEffect(() => {
    if (allRef.current && devRef.current && lifeRef.current) {
      const arr = [allRef, devRef, lifeRef];
      const selectedIndex = hasQueryValue("type", "dev")
        ? 1
        : hasQueryValue("type", "life")
          ? 2
          : 0;
      const rectWidth =
        arr[selectedIndex].current?.getBoundingClientRect().width ?? 0;

      const mapped = arr.slice(0, selectedIndex).reduce((acc, cur) => {
        return (acc += cur.current?.getBoundingClientRect().width ?? 0);
      }, 0);

      const gaps = 16 * selectedIndex;
      setIndicatorX(mapped + gaps);
      setIndicatorWidth(rectWidth);
    }
  }, [allRef, devRef, lifeRef, hasQueryValue, typeValue]);

  const indicatorClass = clsx(
    "bottom-0 absolute h-0.5 bg-gray-700 dark:bg-gray-50 transition-all",
  );

  return (
    <div className="flex h-10 items-center rounded-lg px-2">
      <div className="relative flex h-full w-full border-b-[1px] py-1 dark:border-gray-50">
        {/* TAB INDICATOR */}
        <div
          className={indicatorClass}
          style={{
            transform: `translateX(${indicatorX}px) translateZ(0)`,
            width: indicatorWidth,
          }}
        />

        {/* TABS */}
        <div className="flex h-full w-full gap-4">
          <Link
            href={updateQuery({ type: "all" }, ["category", "group", "tag"])}
            className={getTabStyle("all")}
            ref={allRef}
          >
            All
          </Link>
          <Link
            href={updateQuery({ type: "dev" }, ["category", "group", "tag"])}
            className={getTabStyle("dev")}
            ref={devRef}
          >
            Dev
          </Link>
          <Link
            href={updateQuery({ type: "life" }, ["category", "group", "tag"])}
            className={getTabStyle("life")}
            ref={lifeRef}
          >
            Life
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Tabs;
