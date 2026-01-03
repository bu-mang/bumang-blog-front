"use client";

import { ButtonBase, Tag } from "@/components/common";
import { RoleType } from "@/types";
import { TagCompactType } from "@/types/tag";
import { cn } from "@/utils/cn";
import { getThumbnailByGroup } from "@/utils/getThumnailByGroup";
import { format } from "date-fns";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { MouseEventHandler } from "react";
import { LuLockKeyhole, LuMoveRight } from "react-icons/lu";

interface BlogListItemProps {
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

  isLastItem?: boolean;
}

export default function BlogListItem({
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
  isLastItem,

  author,
  authorRole,
}: BlogListItemProps) {
  const tagWrapperStyle = "flex flex-wrap gap-1 mt-1.5";
  const formattedDate = format(date, "yyyy. MM. dd.");

  return (
    <Link
      href={"/blog/" + id}
      className={cn(
        "group flex items-center justify-between gap-6 border-b py-4",
        isLastItem && "border-b-0",
      )}
      onClick={handleNavigate}
    >
      <div className="flex-1">
        {/* TITLE */}
        <div className="flex items-center gap-1.5 font-semibold group-hover:text-gray-500">
          <div
            className={cn(
              "flex-wrap font-medium",
              "text-lg transition-colors dark:text-gray-100 dark:group-hover:text-white",
            )}
          >
            {title}
          </div>

          {!readPermisson && (
            <LuMoveRight className="animate-arrow text-gray-200 opacity-0 transition-all duration-500 group-hover:opacity-100" />
          )}
        </div>

        {/* CONTENT */}
        <div
          className={cn(
            "flex-1 flex-nowrap text-sm text-gray-300 dark:text-gray-200",
            "line-clamp-2",
          )}
        >
          {previewText}
        </div>

        <div className="mt-2 flex items-center">
          <div className="flex gap-1 text-xs font-semibold text-gray-300">
            <ButtonBase>
              <span className="truncate text-ellipsis">{groupLabel}:</span>
            </ButtonBase>

            <ButtonBase onClick={() => {}}>
              <span className="truncate text-ellipsis">{categoryLabel}</span>
            </ButtonBase>
          </div>

          <div className="mx-2.5 h-2.5 w-[1px] bg-gray-300" />

          <span className="truncate text-xs font-semibold text-gray-300">
            {formattedDate}
          </span>

          <LuLockKeyhole
            size={10}
            className="ml-1.5 dark:text-gray-100 dark:group-hover:text-white"
          />
        </div>

        {/* TAGS */}
        <div className={cn(tagWrapperStyle, "mt-3 gap-2")}>
          {tags?.map((tag) => (
            <Tag
              key={tag.id}
              id={tag.id}
              title={tag.title}
              size={size}
              type="button"
              isActivated={false}
            />
          ))}
        </div>
      </div>

      {/* IMAGE */}
      <div className="relative flex h-[135px] w-full max-w-[240px] shrink-0 cursor-pointer items-center overflow-hidden rounded-lg bg-secondary">
        <Image
          src={thumbnailUrl || getThumbnailByGroup(groupLabel, "blogItem")}
          alt="postImage"
          className="object-cover"
          sizes="(max-width: 768px) 300px, 400px"
          priority={index <= 6}
          fill
        />
      </div>
    </Link>
  );
}
