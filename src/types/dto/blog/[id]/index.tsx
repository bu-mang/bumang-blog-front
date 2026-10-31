import { RoleType } from "@/types/user";

export interface PostDetailResponseDto {
  id: number;
  title: string;
  content: string;
  previewText: string;
  createdAt: string; // Date;
  updatedAt: string; // Date;
  authorNickname: string;
  readPermission: RoleType | null;
  /** block.id → groupId[]. 작성자/owner에게만 응답에 포함된다 (편집용). */
  blockAudienceMap?: Record<string, number[]>;
  /** block.id → group name[]. 모든 viewer에게 옴 (블러 옆 자물쇠 라벨용).
   *  owner: 전체 블록. 비-owner: 본인이 마스킹당한 블록만. */
  blockAudienceLabels?: Record<string, string[]>;
  /** 마스킹된 블록의 BlockNote id 목록 (프론트에서 블러 적용용) */
  maskedBlockIds: string[];
  thumbnailUrl: string;
  views: number;
  likes: number;
  category: {
    id: number;
    label: string;
    slug: string;
  };
  group: {
    id: number;
    label: string;
    slug: string;
  };
  tags: {
    id: number;
    label: string;
    slug: string;
  }[];
}
