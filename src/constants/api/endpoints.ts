import type { PostListFilter } from "@/types";

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
  // 분류 필터는 slug로 보낸다 (?group=backend&category=architecture&tag=aws&tag=kubernetes)
  GET_ALL_POSTS: (
    pageIndex: number,
    pageSize: number,
    filter: PostListFilter = {},
  ) => {
    const params = new URLSearchParams({
      pageIndex: `${pageIndex}`,
      pageSize: `${pageSize}`,
    });
    if (filter.group) params.set("group", filter.group);
    if (filter.category) params.set("category", filter.category);
    if (filter.type) params.set("type", filter.type);
    const tags =
      typeof filter.tag === "string" ? [filter.tag] : (filter.tag ?? []);
    tags.forEach((tag) => params.append("tag", tag));
    return `/posts?${params.toString()}`;
  },

  // BLOG/EDIT
  POST_CREATE_POST: "/posts",
  POST_IMAGE_PRESIGNED_URL: "/s3/presigned-url",
  PATCH_UPDATE_POST: (id: number | string) => `/posts/${id}`,
  DELETE_POST: (id: number | string) => `/posts/${id}`,

  // BLOG/[ID]
  GET_BLOG_DETAIL: (id: number | string) => `/posts/${id}`,
  GET_RELATED_POSTS: (id: number | string) => `/posts/${id}/related`,
  GET_ADJACENT_POSTS: (id: number | string) => `/posts/${id}/adjacent`,
  POST_INCREMENT_VIEW: (id: number | string) => `/posts/${id}/view`,

  // USER GROUPS (OWNER only)
  GET_USER_GROUPS: "/user-groups",
  POST_USER_GROUP: "/user-groups",
  PATCH_USER_GROUP: (id: number | string) => `/user-groups/${id}`,
  DELETE_USER_GROUP: (id: number | string) => `/user-groups/${id}`,
  POST_USER_GROUP_MEMBER: (id: number | string) => `/user-groups/${id}/members`,
  DELETE_USER_GROUP_MEMBER: (id: number | string, userId: number | string) =>
    `/user-groups/${id}/members/${userId}`,

  // AUDIT (HOST only)
  GET_LOGIN_ATTEMPTS: (pageIndex: number, pageSize: number) =>
    `/audit/login-attempts?pageIndex=${pageIndex}&pageSize=${pageSize}`,
  GET_CONTENT_VIEWS: (pageIndex: number, pageSize: number) =>
    `/audit/content-views?pageIndex=${pageIndex}&pageSize=${pageSize}`,
} as const;
