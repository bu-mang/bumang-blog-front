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
