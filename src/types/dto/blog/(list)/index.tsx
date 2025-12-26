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

export interface PostListItemType {
  id: number;
  title: string;
  previewText: string;
  createdAt: string;
  categoryLabel: string;
  groupLabel: string;
  tags: TagCompactType[];
  author: string;
  authorRole: RoleType | null;
  thumbnailUrl: string | null;
  readPermisson: RoleType;
  score?: number;
}
