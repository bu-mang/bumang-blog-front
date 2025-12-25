// API END POINT의 분류 팩토리
export const END_POINTS = {
  // AUTH
  POST_LOGIN: "/auth/login",
  POST_LOGOUT: "/auth/logout",
  POST_RENEW_ACCESS_TOKEN: "/auth/refresh",

  // USER
  GET_USER_PROFILE: "/users/me",

  // BLOG
  GET_GROUP_CATEGORY_MENU_TREE: "/categories/groups/menu",
  GET_ALL_TAGS: "/tags",
  GET_ALL_POSTS: (
    pageIndex: number,
    pageSize: number,
    groupId?: number,
    categoryId?: number,
    tagIds?: string | string[],
    type?: string,
  ) =>
    `/posts?pageIndex=${pageIndex}&pageSize=${pageSize}&groupId=${groupId ?? ""}&categoryId=${categoryId ?? ""}&type=${type ?? ""}&${typeof tagIds === "string" ? `tagIds=${tagIds}` : tagIds?.map((tag) => `tagIds=${tag}`).join("&")}`,

  // BLOG/EDIT
  POST_CREATE_POST: "/posts",
  POST_IMAGE_PRESIGNED_URL: "/s3/presigned-url",
  PATCH_UPDATE_POST: (id: number | string) => `/posts/${id}`,
  DELETE_POST: (id: number | string) => `/posts/${id}`,

  // BLOG/[ID]
  GET_BLOG_DETAIL: (id: number | string) => `/posts/${id}`,
  GET_RELATED_POSTS: (id: number | string) => `/posts/${id}/related`,
  GET_ADJACENT_POSTS: (id: number | string) => `/posts/${id}/adjacent`,
} as const;
