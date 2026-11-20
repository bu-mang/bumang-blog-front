/**
 * 분류(그룹·카테고리·태그)는 slug로 판정한다. 화면 이름(label)은 언제든 바뀔 수 있어
 * 코드가 `label === "Life"`처럼 이름에 묶이면 이름을 고칠 때 기능이 깨진다.
 * 백엔드의 같은 상수: bumang-blog-backend/src/posts/posts.service.ts `LIFE_GROUP_SLUG`.
 */
export const LIFE_GROUP_SLUG = "life";

export const isLifeGroup = (slug: string | null | undefined) =>
  slug === LIFE_GROUP_SLUG;

/**
 * 목록 사이드바에서 한 번에 고를 수 있는 태그 필터 수 (`?tag=a&tag=b…`).
 * 넘으면 Tag 링크가 추가를 막고 토스트를 띄운다. 주소를 손으로 고쳐 더 넣어도 앞의 5개만 쓴다.
 * 프론트에서만 막는다 — 백엔드는 개수를 따지지 않는다.
 */
export const MAX_TAG_FILTERS = 5;

/** 주소의 `tag` 값을 배열로 바꾸고 앞에서부터 MAX_TAG_FILTERS개만 남긴다. */
export const capTagFilters = (tag: string | string[] | null | undefined) =>
  (Array.isArray(tag) ? tag : tag ? [tag] : []).slice(0, MAX_TAG_FILTERS);

/**
 * 블로그 목록 주소(`/blog`)가 받는 쿼리 키. 필터 링크를 만들 때 이 밖의 키는 버린다.
 *
 * 링크가 지금 주소의 쿼리를 통째로 복사하면 예전 키(`?tagIds=`)나 쓰레기 키가 링크마다
 * 따라붙어 주소 종류가 끝없이 늘어난다(크롤러 함정). 2026-11-20 봇이 이런 조합 주소를
 * 30분에 약 4만 9천 번 긁어 프론트가 멈췄다 — 주소가 매번 달라 Cloudflare 캐시도 못 탄다.
 */
export const BLOG_LIST_QUERY_KEYS = [
  "group",
  "category",
  "tag",
  "type",
  "view",
  "pageIndex",
] as const;

/** 분류 개편(2026-11-01) 전에 쓰던 목록 쿼리 키. 지금 목록 페이지는 이 키들을 무시한다. */
export const LEGACY_BLOG_LIST_QUERY_KEYS = [
  "groupId",
  "categoryId",
  "tagIds",
] as const;
