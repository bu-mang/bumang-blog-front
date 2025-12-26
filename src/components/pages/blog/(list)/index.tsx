"use client";

import { Pagenation, LabelWithUtil } from "@/components/common";
import { BlogItem } from "@/components/pages";

import { PaginatedResponseDto, PostListItemType } from "@/types";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/cn";

import { LuCircleAlert } from "react-icons/lu";
import { useAuthStore } from "@/store/auth";
import { BlogItemFallback } from "./blogItem";
import { PagenationFallback } from "@/components/common/pageNation";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useHeaderStore } from "@/store/header";
import { useSearchParams } from "next/navigation";

interface BlogListViewProps {
  allPosts: null | PaginatedResponseDto<PostListItemType>;
  itemViewType: "list" | "thumbnail";
  groupId?: number;
  categoryId?: number;
  postType?: string;
  tagIds?: string | string[];

  pageIndex: number;
  pageSize: number;
}

export default function BlogInner({
  allPosts,
  itemViewType,
  groupId,
  categoryId,
  postType,
  tagIds,

  pageIndex,
  pageSize,
}: BlogListViewProps) {
  const user = useAuthStore((state) => state.user);

  const setDefaultSetting = useHeaderStore((state) => state.setDefaultSetting);
  useEffect(() => {
    setDefaultSetting();
    // eslint-disable-next-line
  }, []);

  // 쿼리스트링에 에러가 있을 시 처리
  const params = useSearchParams();
  useEffect(() => {
    const errorType = params.get("error");

    if (errorType === "unauthorized") {
      //
    }
    // eslint-disable-next-line
  }, []);

  if (!allPosts && !user) {
    return <BlogListFallback itemViewType={itemViewType} />;
  }

  return (
    <BlogListView
      allPosts={allPosts}
      itemViewType={itemViewType}
      groupId={groupId}
      categoryId={categoryId}
      postType={postType}
      tagIds={tagIds}
      pageIndex={pageIndex}
      pageSize={pageSize}
    />
  );
}

function BlogListView({
  allPosts,
  itemViewType,
  postType,
  tagIds,
}: BlogListViewProps) {
  const t = useTranslations("blog");

  // 서버 응답값 확인
  console.log("📦 allPosts 서버 응답:", allPosts);
  console.log("📝 allPosts.data:", allPosts?.data);

  return (
    <div className="col-span-full h-fit md:col-span-3">
      {/*  */}
      <LabelWithUtil
        isTag={typeof tagIds !== "undefined"}
        title={
          allPosts?.subject ||
          postType ||
          (allPosts?.totalCount ? "All" : "unknown")
        }
        amount={allPosts?.totalCount ?? 0}
        itemViewType={itemViewType}
      />

      <div
        className={cn(
          "col-span-full",
          itemViewType === "thumbnail" &&
            allPosts &&
            "grid grid-cols-2 gap-x-[1.5vw] gap-y-[2.5vw] md:grid-cols-3",
        )}
      >
        {/* BLOGITEMS */}
        {allPosts?.data && allPosts?.data.length ? (
          allPosts?.data?.map(
            (
              {
                id,
                title,
                previewText,
                createdAt,
                categoryLabel,
                groupLabel,
                tags,
                author,
                authorRole,
                thumbnailUrl,
                readPermisson,
                score,
              },
              index,
            ) => (
              <BlogItem
                index={index}
                key={id}
                id={id}
                title={title}
                previewText={previewText}
                author={author}
                authorRole={authorRole}
                // category & group
                groupLabel={groupLabel}
                categoryLabel={categoryLabel}
                tags={tags}
                date={createdAt}
                thumbnailUrl={thumbnailUrl}
                readPermisson={readPermisson}
                itemViewType={itemViewType}
                isLastItem={index === allPosts?.data?.length - 1}
              />
            ),
          )
        ) : (
          <div
            className={
              "col-span-4 mb-5 flex h-80 flex-col items-center justify-center py-10 text-gray-200"
            }
          >
            <LuCircleAlert size={24} className="mb-1" />
            <span className="text-lg font-semibold">{t("noPost.title")}</span>
            <span>{t("noPost.desc")}</span>
          </div>
        )}

        {/* PAGE-NATION */}
        <div className="col-span-full mt-5 scale-75 md:col-span-3 md:scale-100">
          <Pagenation
            pageSize={allPosts?.pageSize ?? 12}
            totalCount={allPosts?.totalCount ?? 1}
            currentPage={allPosts?.currentPage ?? 1}
          />
        </div>
      </div>
    </div>
  );
}

interface BlogListFallbackProps {
  itemViewType: "list" | "thumbnail";
}

function BlogListFallback({ itemViewType }: BlogListFallbackProps) {
  const arr = Array.from({ length: 12 }, (_, i) => i + 1);
  return (
    <div className="col-span-full grid h-fit grid-cols-3 gap-x-[1.5vw] md:col-span-3">
      <Skeleton
        className={cn("h-8 w-24", itemViewType === "thumbnail" && "mb-5")}
      />
      <div
        className={cn(
          "col-span-full",
          itemViewType === "thumbnail" &&
            "grid grid-cols-2 gap-x-[1.5vw] gap-y-[4.5vw] md:grid-cols-3",
        )}
      >
        {/* BLOGITEMS */}
        {arr.map((key) => (
          <BlogItemFallback key={key} itemViewType={itemViewType} />
        ))}

        {/* PAGE-NATION */}
        <div className="col-span-full scale-75 md:col-span-3 md:scale-100">
          <PagenationFallback />
        </div>
      </div>
    </div>
  );
}
