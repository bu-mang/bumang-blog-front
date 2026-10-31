import { END_POINTS } from "@/constants/api/endpoints";
import ClientInstance from "@/services/lib/axios";
import serverFetch from "@/services/lib/serverFetch";
import {
  TagType,
  PaginatedResponseDto,
  PostListFilter,
  PostListItemType,
} from "@/types";
import { GroupType } from "@/types/category";

// Group & Category 트리 조회 (ServerFetch)
export const getGroupedCategoryTree = async () => {
  const res = await serverFetch<GroupType[]>(
    process.env.NEXT_PUBLIC_API_BASE_URL +
      END_POINTS.GET_GROUP_CATEGORY_MENU_TREE,
  );

  return res;
};

// TAG 모두 조회 (ServerFetch)
export const getAllTags = async () => {
  const res = await serverFetch<TagType[]>(
    process.env.NEXT_PUBLIC_API_BASE_URL + END_POINTS.GET_ALL_TAGS,
  );

  return res;
};

export const getAllPosts = async (
  pageIndex: number,
  pageSize: number,
  filter: PostListFilter = {},
) => {
  const res = await serverFetch<PaginatedResponseDto<PostListItemType>>(
    process.env.NEXT_PUBLIC_API_BASE_URL +
      END_POINTS.GET_ALL_POSTS(pageIndex, pageSize, filter),
  );

  return res;
};
