import BlogInner from "@/components/pages/blog/(list)";
import { getAllPosts } from "@/services/api/blog/(list)";
import { PaginatedResponseDto, PostListItemType } from "@/types";
import { Metadata } from "next";
import { capTagFilters } from "@/constants/taxonomy";

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
  // 분류 필터는 slug로 받는다. 예전 주소(?groupId= · ?categoryId= · ?tagIds=)는 무시하고
  // 전체 목록을 보여준다 — 분류 개편으로 예전 id가 다른 칸을 가리키거나 없어졌다 (PLANNING.md 2026-11-01).
  const group =
    typeof searchParams.group === "string" ? searchParams.group : undefined;
  const category =
    typeof searchParams.category === "string"
      ? searchParams.category
      : undefined;
  const postType =
    typeof searchParams.type === "string" ? searchParams.type : undefined;
  // 태그 필터는 최대 5개 (사이드바가 막지만, 주소를 손으로 고쳐도 앞의 5개만 쓴다).
  // 태그가 없으면 undefined — 아래에서 "Tag:" 제목 표시를 이 값의 유무로 정한다.
  const tags = capTagFilters(searchParams.tag);
  const tag = tags.length > 0 ? tags : undefined;

  let pageIndex = searchParams.pageIndex ? Number(searchParams.pageIndex) : 1;
  let pageSize = 12;

  try {
    allPosts = await getAllPosts(pageIndex, pageSize, {
      group,
      category,
      tag,
      type: postType,
    });
  } catch (err) {
    console.log(allPosts, err, "allPost error ");
  }

  return (
    <BlogInner
      allPosts={allPosts}
      itemViewType={itemViewType}
      group={group}
      category={category}
      postType={postType}
      tag={tag}
      pageIndex={pageIndex}
      pageSize={pageSize}
    />
  );
}
