/**
 * slug 규칙 — 블로그 안의 모든 slug(그룹·카테고리·태그·사용자 그룹)가 이 한 벌을 쓴다.
 * 정본은 백엔드 bumang-blog-backend/src/common/util/slugify.ts. 여기는 입력 폼의 즉시 검사용이다.
 *
 * - 소문자·숫자를 하이픈으로 잇는다. 하이픈은 단어 사이에만 하나씩 (`-a`, `a--b`, `a-` 불가)
 * - 최대 50자
 * - 비워 두면 백엔드가 이름에서 만든다 (이름에 영문이 없으면 직접 지정해야 한다)
 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX_LENGTH = 50;
