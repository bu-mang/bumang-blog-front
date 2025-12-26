"use client";

import { QUERY_KEY } from "@/constants/api/queryKey";
import { PATHNAME } from "@/constants/routes/pathnameRoutes";
import { getAdjacentPosts, getRelatedPosts } from "@/services/api/blog/[id]";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import BlogItem, { BlogItemFallback } from "../../(list)/blogItem";
import { Skeleton } from "@/components/ui/skeleton";
import { LuCircleAlert } from "react-icons/lu";
import { useTranslations } from "next-intl";

interface RelatedPostInnerProps {
  id: number;
}

export default function RelatedAndAdjacentPost({ id }: RelatedPostInnerProps) {
  return (
    <ErrorBoundary fallback={<RelatedAndAdjacentPostFallback isError />}>
      <Suspense clientOnly fallback={<RelatedAndAdjacentPostFallback />}>
        <RelatedAndAdjacentPostInner id={id} />
      </Suspense>
    </ErrorBoundary>
  );
}

function RelatedAndAdjacentPostFallback({ isError }: { isError?: boolean }) {
  return isError ? null : (
    <>
      <div className="col-start-1 col-end-12 mt-16 rounded-xl p-9">
        <div className="flex justify-between">
          {/* 이전 */}
          <div className="group flex flex-col gap-1 font-medium text-gray-400 hover:text-gray-700">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-40" />
            </div>

            <Skeleton className="h-6 w-40" />
          </div>

          {/* 이후 */}
          <div className="group flex flex-col items-end gap-1 text-gray-400 hover:text-gray-900">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-6" />
            </div>

            <Skeleton className="h-6 w-40" />
          </div>
        </div>
      </div>

      {/* 이 카테고리의 다른 글 */}
      <div className="col-start-1 col-end-12 grid grid-cols-9 gap-x-[1.5vw]">
        <div className="col-span-9 flex justify-center gap-2 pb-8 text-2xl font-semibold text-gray-900">
          <Skeleton className="h-10 w-56" />
        </div>

        {[1, 2, 3].map((item) => (
          <div className="group col-span-3" key={item}>
            <BlogItemFallback itemViewType="thumbnail" />
          </div>
        ))}
      </div>
    </>
  );
}

function RelatedAndAdjacentPostInner({ id }: RelatedPostInnerProps) {
  const t = useTranslations("blogDetail");

  const { data: relatedPosts } = useSuspenseQuery({
    queryKey: QUERY_KEY.GET_RELATED_POSTS(id),
    queryFn: () => getRelatedPosts(id),
  });

  const { data: adjacentPosts } = useSuspenseQuery({
    queryKey: QUERY_KEY.GET_ADJACENT_POSTS(id),
    queryFn: () => getAdjacentPosts(id),
  });

  return (
    <>
      <div className="col-span-full mt-16 grid grid-cols-2 border-t bg-background py-9 md:px-9">
        {/* 이전 */}
        {adjacentPosts.previous && (
          <Link
            href={PATHNAME.BLOG + `/${adjacentPosts.previous.id}`}
            className="group flex flex-col gap-1 font-medium text-gray-400 hover:text-gray-700"
          >
            <div className="flex items-center gap-1.5">
              <ArrowLeft size={18} />
              <span className="text-sm font-semibold">{t("prevPost")}</span>
            </div>

            <div className="max-w-64 truncate text-left font-medium group-hover:underline">
              {adjacentPosts.previous.title}
            </div>
          </Link>
        )}

        {/* 이후 */}
        {adjacentPosts.next ? (
          <Link
            href={PATHNAME.BLOG + `/${adjacentPosts.next.id}`}
            className="group col-start-2 col-end-3 flex flex-col items-end gap-1 text-gray-400 hover:text-gray-900"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold">{t("nextPost")}</span>
              <ArrowRight size={18} />
            </div>

            <div className="w-full max-w-64 truncate text-right font-medium group-hover:underline">
              {adjacentPosts.next.title}
            </div>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* 이 카테고리의 다른 글 */}
      <div className="col-start-1 col-end-12 grid grid-cols-9 gap-x-[1.5vw] gap-y-6 bg-background">
        <div className="col-span-9 flex justify-center gap-2 text-2xl font-semibold text-foreground">
          <span>{t("relatedPost")}</span>
        </div>

        {relatedPosts.length > 0 ? (
          relatedPosts.map(
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
                thumbnailUrl,
                readPermisson,
              },
              index,
            ) => {
              return (
                <div className="group col-span-full md:col-span-3" key={id}>
                  <BlogItem
                    index={index}
                    key={id}
                    id={id}
                    title={title}
                    previewText={previewText}
                    author={author}
                    // category & group
                    groupLabel={groupLabel}
                    categoryLabel={categoryLabel}
                    tags={tags}
                    date={createdAt}
                    thumbnailUrl={thumbnailUrl}
                    readPermisson={readPermisson}
                    itemViewType="thumbnail"
                  />
                </div>
              );
            },
          )
        ) : (
          <div
            className={
              "col-span-9 mb-5 flex h-80 flex-col items-center justify-center py-10 text-gray-200"
            }
          >
            <LuCircleAlert size={24} className="mb-1" />
            <span className="text-lg font-semibold">
              {t("noRelatedPost.title")}
            </span>
            <span>{t("noRelatedPost.desc")}</span>
          </div>
        )}
      </div>
    </>
  );
}
