import BlogInner from "@/components/pages/blog/(list)";
import { getAllPosts } from "@/services/api/blog/(list)";
import { PaginatedResponseDto, PostListItemType } from "@/types";
import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    languages: {
      'x-default': 'https://bumang.xyz/ko/blog',
      ko: 'https://bumang.xyz/ko/blog',
      en: 'https://bumang.xyz/en/blog',
    },
  },
};

interface PageProps {
  params: { category: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Blog({ searchParams }: PageProps) {
  let allPosts: null | PaginatedResponseDto<PostListItemType> = null;

  // QUERIES
  let itemViewType: "list" | "thumbnail" =
    searchParams.view === "list" ? "list" : "thumbnail";
  const groupId =
    typeof searchParams.groupId === "string"
      ? Number(searchParams.groupId)
      : undefined;
  const categoryId =
    typeof searchParams.categoryId === "string"
      ? Number(searchParams.categoryId)
      : undefined;
  const postType =
    typeof searchParams.type === "string" ? searchParams.type : undefined;
  const tagIds = searchParams.tagIds;

  let pageIndex = searchParams.pageIndex ? Number(searchParams.pageIndex) : 1;
  let pageSize = 12;

  try {
    allPosts = await getAllPosts(
      pageIndex,
      pageSize,
      groupId,
      categoryId,
      tagIds,
      postType,
    );
  } catch (err) {
    console.log(allPosts, err, "allPost error ");
  }

  return (
    <BlogInner
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
