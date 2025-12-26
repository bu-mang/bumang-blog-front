"use client";

import { PATHNAME } from "@/constants/routes/pathnameRoutes";
import { RoleType } from "@/types";
import { TagCompactType } from "@/types/tag";
import { useCheckPermission } from "@/utils/canReadArticle";
import { useRouter } from "@/i18n/navigation";
import { MouseEventHandler } from "react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import CustomNotification from "@/components/common/customNotification";
import { Skeleton } from "@/components/ui/skeleton";
import BlogListItem from "./blogListItem";
import BlogThumbnailItem from "./blogThumbnailItem";

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
  authorRole: null | RoleType;
  isLastItem?: boolean;
}

const BlogItem = ({
  index,
  title,
  previewText,
  categoryLabel,
  groupLabel,
  author,
  authorRole,
  tags,
  date,
  id,
  thumbnailUrl,
  itemViewType,
  size = "sm",
  readPermisson,
  isLastItem,
}: BlogItemProps) => {
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
        autoClose: 5000,
      });
      return;
    }
  };

  const commonProps = {
    index,
    id,
    title,
    previewText,
    categoryLabel,
    groupLabel,
    tags,
    date,
    thumbnailUrl,
    size,
    readPermisson,
    handleNavigate,
    author,
    authorRole,
  };

  switch (itemViewType) {
    case "list":
      return <BlogListItem {...commonProps} isLastItem={isLastItem} />;

    case "thumbnail":
    default:
      return <BlogThumbnailItem {...commonProps} />;
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
