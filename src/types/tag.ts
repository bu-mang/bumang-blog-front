/**
 * 태그의 기능
 * 1. 링크: 누르면 쿼리스트링 바꾸기 -> 데이터 패칭
 * 2. 버튼: 누르면 핸들러 발동 -> ui조작 혹은 데이터 패칭
 * 3. 라벨: 상호작용없이 정보 보여주기
 */

/**
 * TagType:
 * 서버에서 패칭 해오는 값.
 */
export interface TagType {
  id: number;
  title: string;
  /** 주소용 고정 키 (예: "kubernetes") */
  slug: string;
  group: {
    id: number;
    label: string;
    slug: string;
  };
}

export type TagCompactType = Pick<TagType, "title" | "id" | "slug">;
