"use client";

import { PATHNAME } from "@/constants/routes/pathnameRoutes";
import { RoleType } from "@/types";
import { TagCompactType } from "@/types/tag";
import { cn } from "@/utils/cn";
import { getThumbnailByGroup } from "@/utils/getThumnailByGroup";
import { formatViewCount } from "@/utils/formatViewCount";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { MouseEventHandler } from "react";
import { LuEye, LuLockKeyhole, LuMoveRight } from "react-icons/lu";

interface BlogThumbnailItemProps {
  index: number;
  id: number;
  title: string;
  previewText: string;
  categoryLabel: string;
  categorySlug: string | null;
  groupLabel: string;
  groupSlug: string | null;
  tags: TagCompactType[];
  date: string;
  thumbnailUrl: string | null;
  size?: "lg" | "sm";
  readPermisson: null | RoleType;
  handleNavigate: MouseEventHandler<HTMLAnchorElement>;

  author: string;
  authorRole: null | RoleType;
  view?: number;
}

export default function BlogThumbnailItem({
  index,
  title,
  previewText,
  categoryLabel,
  categorySlug,
  groupLabel,
  groupSlug,
  tags,
  date,
  id,
  thumbnailUrl,
  size = "sm",
  readPermisson,
  handleNavigate,
  author,
  authorRole,
  view,
}: BlogThumbnailItemProps) {
  const t = useTranslations("blog");
  const contentStyle =
    "line-clamp-1 flex-1 flex-nowrap text-sm text-gray-300 dark:text-gray-200";
  const tagWrapperStyle = "flex flex-wrap gap-1 mt-1.5";
  const formattedDate = format(date, "yyyy.MM.dd.");

  return (
    <div className="group">
      {/* 이미지·제목·본문 → 글로 이동 */}
      <Link href={"/blog/" + id} className="block" onClick={handleNavigate}>
        {/* IMAGE */}
        <div className="relative aspect-video w-full cursor-pointer overflow-hidden rounded-lg bg-secondary">
          <Image
            src={thumbnailUrl || getThumbnailByGroup(groupSlug, "blogItem")}
            alt="postImage"
            className="object-cover object-top transition-all group-hover:scale-110"
            sizes="(max-width: 768px) 300px, 400px"
            priority={index <= 6}
            fill
          />
        </div>

        {/* TITLE */}
        <div className="mb-1 mt-2 group-hover:text-gray-500 dark:text-gray-50 dark:group-hover:text-white">
          <div
            className={"flex-1 flex-wrap text-base font-medium leading-tight"}
          >
            {title}
          </div>
        </div>

        {/* CONTENT */}
        <div className={contentStyle}>{previewText}</div>
      </Link>

      {/* GROUP & CATEGORY → 필터 이동 (호버 언더라인) */}
      <div className="mt-2.5 flex flex-col justify-center">
        <span className="line-clamp-1 flex-nowrap text-xs font-semibold text-gray-300">
          {groupSlug != null ? (
            <Link
              href={`${PATHNAME.BLOG}?group=${groupSlug}`}
              className="hover:text-gray-500 hover:underline"
            >
              {groupLabel}
            </Link>
          ) : (
            groupLabel
          )}
          {": "}
          {categorySlug != null ? (
            <Link
              href={`${PATHNAME.BLOG}?category=${categorySlug}`}
              className="hover:text-gray-500 hover:underline"
            >
              {categoryLabel}
            </Link>
          ) : (
            categoryLabel
          )}
        </span>
      </div>

      <div
        className={cn(
          "mb-1.5 flex h-5 items-center gap-1",
          !readPermisson && "justify-between",
        )}
      >
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "w-fit flex-shrink-0 flex-nowrap rounded-md border-gray-300 text-2xs font-semibold text-gray-300",
              authorRole === "guest" && "text-red-400",
            )}
          >
            {authorRole === "guest" ? `deleted at 00:00` : formattedDate}
          </div>

          <span className="flex items-center gap-0.5 text-2xs font-semibold text-gray-300">
            <LuEye size={11} />
            {formatViewCount(view, t("viewsUnderTen"))}
          </span>
        </div>

        {/* 잠금 */}
        {!readPermisson ? (
          <LuMoveRight
            size={10}
            className="animate-arrow text-gray-200 opacity-0 transition-all duration-500 group-hover:opacity-100"
          />
        ) : (
          <div className="flex items-center gap-0.5 transition-colors group-hover:text-destructive">
            <LuLockKeyhole
              size={10}
              className="my-1.5 text-gray-200 transition-colors group-hover:text-destructive"
            />
            <span className="text-2xs font-semibold capitalize text-gray-300 transition-colors group-hover:text-destructive">
              {readPermisson}
            </span>
          </div>
        )}
      </div>

      {/* TAGS → 필터 이동 (호버 배경·글자 진하게) */}
      <div className={tagWrapperStyle}>
        {tags?.map((tag) => (
          <Link
            key={tag.id}
            href={`${PATHNAME.BLOG}?tag=${tag.slug}`}
            className="h-fit shrink-0 truncate rounded-3xs bg-gray-1 px-1 py-0.5 text-2xs text-gray-200 shadow-sm transition-all hover:bg-gray-5 hover:text-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:text-white"
          >
            {tag.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
