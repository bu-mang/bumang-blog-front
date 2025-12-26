"use client";

import { useQueryParams } from "@/hooks/useQueryParams";

import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import React from "react";
import { LuX as CloseIcon } from "react-icons/lu";

export interface TagProps {
  id: number;
  title: string;

  url?: string;
  onClick?: () => void;
  type?: "link" | "button";
  size?: "sm" | "lg";

  className?: string;
  hasBackground?: boolean;
  fixedBgColor?: "dark" | "lightGray";

  hasXButton?: boolean;
  isActivated?: boolean;
  setIsActivated?: (v?: boolean) => void; // 단순 Label로 쓸 경우 불필요하기 때문에 Optional
}

const Tag = ({
  id,
  title,

  onClick,
  className,

  size = "lg",
  type = "link",

  hasXButton = true,
  hasBackground = true,
  isActivated = false,
  setIsActivated,
}: TagProps) => {
  const { updateArrayQuery } = useQueryParams();
  const router = useRouter();

  const handleClick = () => {
    if (setIsActivated) setIsActivated();
    if (!onClick) return;
    onClick();
  };

  const tagClass = cn(
    "flex gap-2 items-center h-fit bg-gray-1 dark:bg-gray-700 text-gray-200 transition-all truncate shadow-sm",
    {
      // SIZE
      ["rounded-lg px-2 py-1 text-sm"]: size === "lg",
      ["rounded-3xs px-1 py-0.5 text-2xs"]: size === "sm",

      // BACKGROUND
      ["bg-gray-700 text-white hover:bg-gray-500"]:
        isActivated && !!hasBackground,
      ["text-gray-900"]: isActivated && !hasBackground,

      // ISACTIVE
      ["bg-transparent"]: !hasBackground,
      ["hover:bg-gray-5"]: !!hasBackground,
    },
    className,
  );

  if (type === "link") {
    return (
      <Link
        href={updateArrayQuery("tagIds", `${id}`, "add")}
        className={tagClass}
      >
        <span>{title}</span>
        {isActivated && !!hasBackground && !!hasXButton && (
          <CloseIcon
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(updateArrayQuery("tagIds", `${id}`, "remove"));
            }}
          />
        )}
      </Link>
    );
  } else {
    // type === "button"
    return (
      <button onClick={handleClick} className={tagClass}>
        {title}
        {isActivated && !!hasBackground && !!hasXButton && <CloseIcon />}
      </button>
    );
  }
};

export default Tag;
