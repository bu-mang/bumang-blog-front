import { TagCompactType } from "@/types/tag";
import { RoleType } from "@/types/user";

export interface PaginatedResponseDto<T> {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  data: T[];

  subject?: string;
}

/** 글 목록 필터. 전부 slug다 (예전 id 필터는 쓰지 않는다). */
export interface PostListFilter {
  group?: string;
  category?: string;
  tag?: string | string[];
  type?: string;
}

export interface PostListItemType {
  id: number;
  title: string;
  previewText: string;
  createdAt: string;
  categoryLabel: string;
  categoryId: number | null;
  /** 필터 링크용 (?category=) */
  categorySlug: string | null;
  groupLabel: string;
  groupId: number | null;
  /** 필터 링크·기본 썸네일용 (?group=) */
  groupSlug: string | null;
  tags: TagCompactType[];
  author: string;
  authorRole: RoleType | null;
  thumbnailUrl: string | null;
  readPermisson: RoleType;
  score?: number;
  view?: number;
}
