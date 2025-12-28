"use client";

import { Tag } from "@/components/common";
import { RoleType } from "@/types";
import { TagCompactType } from "@/types/tag";
import { cn } from "@/utils/cn";
import { getThumbnailByGroup } from "@/utils/getThumnailByGroup";
import { format } from "date-fns";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { MouseEventHandler } from "react";
import { LuLockKeyhole, LuMoveRight } from "react-icons/lu";

interface BlogThumbnailItemProps {
  index: number;
  id: number;
  title: string;
  previewText: string;
  categoryLabel: string;
  groupLabel: string;
  tags: TagCompactType[];
  date: string;
  thumbnailUrl: string | null;
  size?: "lg" | "sm";
  readPermisson: null | RoleType;
  handleNavigate: MouseEventHandler<HTMLAnchorElement>;

  author: string;
  authorRole: null | RoleType;
}

export default function BlogThumbnailItem({
  index,
  title,
  previewText,
  categoryLabel,
  groupLabel,
  tags,
  date,
  id,
  thumbnailUrl,
  size = "sm",
  readPermisson,
  handleNavigate,
  author,
  authorRole,
}: BlogThumbnailItemProps) {
  const contentStyle =
    "line-clamp-1 flex-1 flex-nowrap text-sm text-gray-300 dark:text-gray-200 text-sm";
  const tagWrapperStyle = "flex flex-wrap gap-1 mt-1.5";
  const formattedDate = format(date, "yyyy.MM.dd.");

  return (
    <Link href={"/blog/" + id} className="group" onClick={handleNavigate}>
      {/* IMAGE */}
      <div className="relative aspect-video w-full cursor-pointer overflow-hidden rounded-lg bg-gray-50">
        <Image
          src={thumbnailUrl || getThumbnailByGroup(groupLabel, "blogItem")}
          alt="postImage"
          className="object-cover object-top transition-all group-hover:scale-110"
          sizes="(max-width: 768px) 300px, 400px"
          priority={index <= 6}
          fill
        />
      </div>

      {/* TITLE */}
      <div className="mb-1 mt-2 group-hover:text-gray-500 dark:text-gray-50 dark:group-hover:text-white">
        <div className={"flex-1 flex-wrap text-base font-medium leading-tight"}>
          {title}
        </div>
      </div>

      {/* CONTENT */}
      <div className={contentStyle}>{previewText}</div>

      {/* GROUP & CATEGORY */}
      <div className="mt-1.5 flex flex-col justify-center">
        <span
          className={cn(
            "line-clamp-1 flex-nowrap text-xs font-semibold text-gray-300",
          )}
        >
          {groupLabel}: {categoryLabel}
        </span>
      </div>

      <div
        className={cn(
          "mb-1.5 flex h-5 items-center gap-1",
          !readPermisson && "justify-between",
        )}
      >
        <div
          className={cn(
            "w-fit flex-shrink-0 flex-nowrap rounded-md border-gray-300 text-2xs font-semibold text-gray-300",
            authorRole === "user" && "text-red-400",
          )}
        >
          {authorRole === "user" ? `deleted at 00:00` : formattedDate}
        </div>

        {/* 잠금 */}
        {!readPermisson ? (
          <LuMoveRight
            size={10}
            className={cn(
              "animate-arrow text-gray-200 opacity-0 transition-all duration-500 group-hover:opacity-100",
              readPermisson === "user" && "text-red-400",
            )}
          />
        ) : (
          <LuLockKeyhole
            size={10}
            className={cn(
              "my-1.5 text-gray-200",
              readPermisson === "user" && "text-red-400",
            )}
          />
        )}
      </div>

      {/* TAGS */}
      <div className={tagWrapperStyle}>
        {tags?.map((tag) => (
          <Tag
            key={tag.id}
            id={tag.id}
            title={tag.title}
            size={size}
            type="button"
            isActivated={false}
            className="pointer-events-none"
          />
        ))}
      </div>
    </Link>
  );
}
