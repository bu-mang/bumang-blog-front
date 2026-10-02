export const QUERY_KEY = {
  // POST
  GET_POSTS: (
    pageIndex: number,
    pageSize: number,
    groupId?: number,
    categoryId?: number,
    tagIds?: string | string[],
    postType?: string,
  ) => ["POSTS", pageIndex, pageSize, groupId, categoryId, tagIds, postType],

  // USER

  // BLOG_DETAIL
  GET_RELATED_POSTS: (id: number | string) => ["RELATED_POSTS", id],
  GET_ADJACENT_POSTS: (id: number | string) => ["ADJACENT_POSTS", id],
  GET_BLOG_AUTHENTICATED_DETAIL: (id: number | string) => [
    "AUTHENTICATED_DETAIL",
    id,
  ],
} as const;
