import { usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { BLOG_LIST_QUERY_KEYS, capTagFilters } from "@/constants/taxonomy";

const KNOWN_KEYS = new Set<string>(BLOG_LIST_QUERY_KEYS);

/**
 * 블로그 목록의 필터·보기·페이지 링크를 만드는 훅 (사이드바·태그·페이지네이션).
 * 링크는 지금 주소에서 **목록이 아는 키만** 이어받는다 — 이유는 BLOG_LIST_QUERY_KEYS 주석.
 */
export function useQueryParams() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentParams = () => {
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (KNOWN_KEYS.has(key)) params.append(key, value);
    });
    return params;
  };

  const getQueryValue = (key: string) => {
    return searchParams.get(key);
  };

  const updateQuery = (
    updates: Record<string, string>,
    removes?: string[] | Record<string, string | null>,
  ) => {
    const params = currentParams();
    Object.entries(updates).forEach(([key, value]) => {
      params.set(key, value);
    });

    if (removes) {
      if (Array.isArray(removes)) {
        // 기존 로직: 무조건 제거
        removes.forEach((item) => {
          params.delete(item);
        });
      } else {
        // 새로운 로직: 값이 일치할 때만 제거
        Object.entries(removes).forEach(([key, value]) => {
          if (value === null || params.get(key) === value) {
            params.delete(key);
          }
        });
      }
    }
    return `${pathname}?${params.toString()}`;
  };

  const updateArrayQuery = (
    key: string,
    value: string,
    action: "add" | "remove" | "toggle" = "toggle",
  ) => {
    const params = currentParams();
    const currentValues = params.getAll(key);

    let newValues: string[];

    switch (action) {
      case "add":
        newValues = currentValues.includes(value)
          ? currentValues
          : [...currentValues, value];
        break;
      case "remove":
        newValues = currentValues.filter((v) => v !== value);
        break;
      case "toggle":
      default:
        newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value) // 제거
          : [...currentValues, value]; // 추가
        break;
    }

    // 태그는 최대 MAX_TAG_FILTERS개. 한도에서 하나 더 "추가"하는 링크는 지금 주소와 같아져
    // 새 조합 주소가 생기지 않는다 (클릭은 tag.tsx가 막고 토스트를 띄운다).
    if (key === "tag") newValues = capTagFilters(newValues);

    // 기존 값들 모두 제거
    params.delete(key);

    // 새 값들 추가
    newValues.forEach((v) => params.append(key, v));

    // 필터가 바뀌면 1페이지부터 본다. 이어받으면 "7페이지 + 새 필터" 같은 조합만 늘어난다.
    params.delete("pageIndex");

    return `${pathname}?${params.toString()}`;
  };

  const removeQuery = (keys: string | string[]) => {
    const params = currentParams();
    const keysArray = Array.isArray(keys) ? keys : [keys];
    keysArray.forEach((key) => params.delete(key));
    return `${pathname}?${params.toString()}`;
  };

  const hasQuery = (key: string) => {
    const value = searchParams.get(key);
    return value !== null && value.trim() !== "";
  };

  const hasQueryValue = (key: string, expectedValue: string) => {
    return searchParams.get(key) === expectedValue;
  };

  return {
    getQueryValue,
    updateQuery,
    updateArrayQuery,
    removeQuery,
    hasQuery,
    hasQueryValue,
  };
}
