import * as BlogItems from "@/assets/thumbnails/asBlogItem";
import * as PostBanners from "@/assets/thumbnails/compressed";

type ThumbnailKey = keyof typeof BlogItems & keyof typeof PostBanners;

/**
 * 그룹 slug → 기본 썸네일 이미지. 글에 썸네일이 없을 때 쓴다.
 *
 * 화면 이름(label)이 아니라 slug로 고른다 — 이름을 바꿔도 이미지가 안 빠지게.
 * database·ai는 전용 이미지가 아직 없어 backend·projects 이미지를 빌려 쓴다 (PLANNING.md 2026-11-01).
 */
const THUMBNAIL_BY_GROUP_SLUG: Record<string, ThumbnailKey> = {
  frontend: "frontend",
  backend: "backend",
  database: "backend",
  devops: "infrastructure",
  ai: "projects",
  "computer-science": "computerScience",
  "game-dev": "interactive",
  life: "life",
};

/** 목록에 없는 그룹(새로 만든 그룹 등)은 빈 src 대신 이 이미지를 쓴다. */
const FALLBACK: ThumbnailKey = "projects";

export function getThumbnailByGroup(
  groupSlug: string | null | undefined,
  as: "blogItem" | "postBanner" = "postBanner",
) {
  const key = (groupSlug && THUMBNAIL_BY_GROUP_SLUG[groupSlug]) || FALLBACK;
  return as === "blogItem" ? BlogItems[key] : PostBanners[key];
}
