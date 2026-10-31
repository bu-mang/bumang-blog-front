"use client";

import { useQueryParams } from "@/hooks/useQueryParams";

import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import { MAX_TAG_FILTERS, capTagFilters } from "@/constants/taxonomy";
import CustomNotification from "@/components/common/customNotification";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import React, { MouseEventHandler } from "react";
import { LuX as CloseIcon } from "react-icons/lu";
import { toast } from "react-toastify";

export interface TagProps {
  id: number;
  title: string;
  /** type="link"일 때 필터 주소(?tag=)에 쓰는 고정 키. 없으면 링크가 아무 데도 안 간다 */
  slug?: string;

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
  slug,

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
  const searchParams = useSearchParams();
  const t = useTranslations("alert");

  // 태그 필터는 최대 MAX_TAG_FILTERS개 — 다 찼으면 아직 안 고른 태그는 추가하지 않는다
  const activeTagSlugs = capTagFilters(searchParams.getAll("tag"));
  const isTagLimitReached =
    type === "link" &&
    !!slug &&
    !activeTagSlugs.includes(slug) &&
    activeTagSlugs.length >= MAX_TAG_FILTERS;

  const handleLinkClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (!isTagLimitReached) return;
    e.preventDefault();

    toast(CustomNotification, {
      toastId: "tag-filter-limit", // 여러 번 눌러도 하나만 뜨게
      data: {
        title: t("tagLimit.title", { max: MAX_TAG_FILTERS }),
        content: t("tagLimit.desc"),
        buttonText: t("tagLimit.buttonText"),
      },
      ariaLabel: t("tagLimit.ariaLabel"),
      autoClose: 3000,
    });
  };

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
        href={slug ? updateArrayQuery("tag", slug, "add") : "#"}
        onClick={handleLinkClick}
        aria-disabled={isTagLimitReached}
        className={cn(tagClass, isTagLimitReached && "opacity-40")}
      >
        <span>{title}</span>
        {isActivated && !!hasBackground && !!hasXButton && (
          <CloseIcon
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (slug) router.push(updateArrayQuery("tag", slug, "remove"));
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
