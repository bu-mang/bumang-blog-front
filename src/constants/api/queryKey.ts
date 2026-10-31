import type { PostListFilter } from "@/types";

export const QUERY_KEY = {
  // POST
  GET_POSTS: (
    pageIndex: number,
    pageSize: number,
    filter: PostListFilter = {},
  ) => ["POSTS", pageIndex, pageSize, filter] as const,

  // USER

  // BLOG_DETAIL
  GET_RELATED_POSTS: (id: number | string) => ["RELATED_POSTS", id],
  GET_ADJACENT_POSTS: (id: number | string) => ["ADJACENT_POSTS", id],
  GET_BLOG_AUTHENTICATED_DETAIL: (id: number | string) => [
    "AUTHENTICATED_DETAIL",
    id,
  ],
} as const;
