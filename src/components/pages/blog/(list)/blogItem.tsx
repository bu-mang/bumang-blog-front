"use client";

import { ButtonBase, Tag } from "@/components/common";
import CustomNotification from "@/components/common/customNotification";
import { Skeleton } from "@/components/ui/skeleton";
import { PATHNAME } from "@/constants/routes/pathnameRoutes";
import { RoleType } from "@/types";
import { TagCompactType } from "@/types/tag";
import { useCheckPermission } from "@/utils/canReadArticle";
import { cn } from "@/utils/cn";
import { getThumbnailByGroup } from "@/utils/getThumnailByGroup";
import { format } from "date-fns";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { MouseEventHandler } from "react";
import { LuLockKeyhole, LuMoveRight } from "react-icons/lu";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

interface BlogItemProps {
  index: number;
  id: number;
  title: string;
  previewText: string;
  categoryLabel: string;
  groupLabel: string;
  author: string;
  tags: TagCompactType[];
  date: string;
  thumbnailUrl: string | null;
  itemViewType: "thumbnail" | "list";
  size?: "lg" | "sm";
  readPermisson: null | RoleType;
}

const BlogItem = ({
  index,
  title,
  previewText,
  categoryLabel,
  groupLabel,
  author,
  tags,
  date,
  id,
  thumbnailUrl,
  itemViewType, // thumbnail | list
  size = "sm",
  readPermisson,
}: BlogItemProps) => {
  const titleStyle = "flex-1 flex-wrap font-medium text-base";
  const contentStyle =
    "line-clamp-1 flex-1 flex-nowrap text-sm text-gray-300 dark:text-gray-200 text-sm";
  const tagWrapperStyle = "flex flex-wrap gap-1 mt-1.5";
  const formattedDate = format(date, "yyyy. MM. dd.");
  const t = useTranslations("alert");

  // 권한 체크 및 네비게이팅 막기
  const canRead = useCheckPermission(readPermisson);
  const router = useRouter();

  const handleNavigate: MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (!canRead) {
      e.preventDefault();

      toast(CustomNotification, {
        data: {
          title: t("noPermission.title"),
          content: t("noPermission.desc") + ` ${readPermisson}`,
          onClick: () => router.push(PATHNAME.LOGIN),
          buttonText: t("noPermission.buttonText"),
        },
        ariaLabel: t("noPermission.ariaLabel"),
        autoClose: 5000, // false에서 숫자로 변경
      });
      return;
    }
  };

  switch (itemViewType) {
    case "list":
      return (
        <Link
          href={"/blog/" + id}
          className="group flex items-center justify-between gap-6 py-8 lg:gap-28"
          onClick={handleNavigate}
        >
          <div className="flex-1">
            {/* TITLE */}
            <div className="mb-2 mt-2.5 flex items-center text-2xl font-semibold group-hover:text-gray-500">
              <div
                className={cn(
                  titleStyle,
                  "text-lg transition-colors dark:text-gray-100 dark:group-hover:text-white",
                )}
              >
                {title}
              </div>
              {!readPermisson ? (
                <LuMoveRight className="animate-arrow text-gray-200 opacity-0 transition-all duration-500 group-hover:opacity-100" />
              ) : (
                <LuLockKeyhole
                  size={14}
                  className="dark:text-gray-100 dark:group-hover:text-white"
                />
              )}
            </div>

            {/* CONTENT */}
            <div className={cn(contentStyle, "line-clamp-2 text-base")}>
              {previewText}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div className="flex truncate text-ellipsis text-sm font-semibold text-gray-100">
                <ButtonBase
                // onClick={() => router.push(PATHNAME.BLOG + `${}`)}
                >
                  <span className="truncate text-ellipsis">{groupLabel}</span>
                </ButtonBase>
                <span>•</span>
                <ButtonBase onClick={() => {}}>
                  <span className="truncate text-ellipsis">
                    {categoryLabel}
                  </span>
                </ButtonBase>
              </div>
              <div className="h-2 w-[1px] bg-gray-100" />
              <span className="truncate text-sm font-semibold text-gray-100">
                {formattedDate}
              </span>
            </div>

            {/* TAGS */}
            <div className={cn(tagWrapperStyle, "mt-4 gap-2")}>
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
          <div className="relative h-[135px] w-full max-w-[240px] shrink-0 cursor-pointer overflow-hidden rounded-lg bg-gray-50">
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

    case "thumbnail":
    default:
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

          {/* GROUP & CATEGORY */}
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={cn(
                "line-clamp-1 flex-nowrap text-xs font-semibold text-gray-100",
              )}
            >
              {groupLabel} / {categoryLabel}
            </span>

            <div className="h-2.5 w-[1px] bg-gray-100" />

            <span
              className={cn(
                "flex-shrink-0 flex-nowrap text-xs font-semibold text-gray-100",
                readPermisson === "user" && "text-red-400",
              )}
            >
              {readPermisson === "user" ? `deleted at 00:00` : formattedDate}
            </span>
          </div>

          {/* TITLE */}
          <div className="mt-1 flex items-start group-hover:text-gray-500 dark:text-gray-50 dark:group-hover:text-white">
            <div className={titleStyle}>{title}</div>
            {!readPermisson ? (
              <LuMoveRight className="animate-arrow text-gray-200 opacity-0 transition-all duration-500 group-hover:opacity-100" />
            ) : (
              <LuLockKeyhole size={14} className="my-1.5" />
            )}
          </div>

          {/* CONTENT */}
          <div className={contentStyle}>{previewText}</div>

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
};

export default BlogItem;

interface BlogItemFallbackProps {
  itemViewType: "thumbnail" | "list";
}

export function BlogItemFallback({ itemViewType }: BlogItemFallbackProps) {
  switch (itemViewType) {
    case "thumbnail":
      return (
        <div className="group">
          {/* IMAGE */}
          <div className="relative aspect-video w-full cursor-pointer overflow-hidden rounded-lg">
            <Skeleton className="h-full w-full" />
          </div>

          {/* TITLE */}
          <div className="mb-1 mt-2.5 flex items-center gap-1 group-hover:text-gray-500">
            <Skeleton className="h-6 w-full" />

            <Skeleton className="h-6 w-6" />
          </div>

          {/* CONTENT */}
          <Skeleton className="mb-3 h-6 w-full" />

          {/* TAGS */}
          <div className="flex gap-1">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      );

    case "list":
    default:
      return (
        <div className="flex items-center justify-between gap-6 py-8 lg:gap-28">
          <div className="flex flex-1 flex-col">
            {/* TITLE */}
            <div className="mb-2 mt-2.5 flex items-center">
              <Skeleton className="h-8 w-full max-w-96" />
            </div>

            {/* CONTENT */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-full max-w-2xl" />
              <Skeleton className="h-5 w-full max-w-xl" />
            </div>

            <div className="mt-4 flex items-center gap-5">
              <div className="flex gap-1">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-12" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </div>

          {/* IMAGE */}
          <div className="relative h-[135px] w-full max-w-[240px] shrink-0 cursor-pointer overflow-hidden rounded-lg">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      );
  }
}
