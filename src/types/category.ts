import type { RoleType, DateType } from "@/types";
import { IndicatorValues } from "./indicatorValue";

export interface CategoryNode extends IndicatorValues {
  /** 아이디 */
  id: string;

  /** 상위카테고리, (null이면 상위카테고리) */
  parent: string | null;

  /** 유저 권한 별 노출 여부 - null(public) | "guest" | "member" | "host" */
  permissions: RoleType[];
}

export type CategoryWithDate = DateType & CategoryNode;

export interface CategoryType {
  id: number;
  label: string;
  /** 주소용 고정 키 (예: "architecture"). 화면 이름(label)과 달리 바뀌지 않는다 */
  slug: string;
  order: string;
}

export interface GroupType {
  id: number;
  label: string;
  /** 주소·판정용 고정 키 (예: "life"면 Life 탭). 화면 이름(label)과 달리 바뀌지 않는다 */
  slug: string;
  categories: CategoryType[];

  totalPostsCount: number;
}
