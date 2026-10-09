/**
 * 붙여넣는 마크다운을 "줄 = 문단" 규칙으로 바꾼다.
 *
 * 마크다운 표준에서는 줄바꿈 하나가 같은 문단 안의 줄바꿈(Shift+Enter)이 되고,
 * 빈 줄은 몇 개를 넣어도 문단 구분 하나로 합쳐진다. 이 블로그의 글은
 * 문장마다 Enter로 문단을 나누고 묶음 사이에 빈 문단을 두는 식으로 쓰기 때문에,
 * 초안을 그대로 붙여넣으면 모양이 달라진다. 그래서 파싱 전에 이렇게 바꾼다.
 *
 * - 본문 한 줄 → 문단 하나
 * - 빈 줄 하나 → 빈 문단 하나 (제목 바로 아래 빈 줄은 제외)
 * - 코드 블록·표·리스트·인용은 건드리지 않는다
 */

/** 빈 문단 자리를 표시하는 값. 파싱 뒤 isEmptyParagraphMarker로 찾아 비운다. */
export const EMPTY_PARAGRAPH_MARKER = "​";

const FENCE = /^\s{0,3}(```|~~~)/;
const HEADING = /^\s{0,3}#{1,6}\s/;
const STRUCTURAL = [
  /^\s{0,3}([-*+]|\d+[.)])\s/, // 리스트
  /^\s{0,3}>/, // 인용
  /^\s*\|/, // 표
  /^\s{0,3}(-{3,}|\*{3,}|_{3,})\s*$/, // 구분선
];

type LineKind = "text" | "heading" | "structural" | "code";

export function splitLinesIntoParagraphs(markdown: string): string {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  let prev: LineKind | null = null;
  let pendingBlanks = 0;
  let inFence = false;

  // 직전 줄과 떨어진 블록이 되도록 빈 줄 하나를 둔다.
  const separate = () => {
    if (out.length > 0 && out[out.length - 1] !== "") out.push("");
  };

  for (const line of lines) {
    if (inFence) {
      out.push(line);
      if (FENCE.test(line)) inFence = false;
      continue;
    }

    if (line.trim() === "") {
      pendingBlanks += 1;
      continue;
    }

    let kind: LineKind = "text";
    if (FENCE.test(line)) kind = "code";
    else if (HEADING.test(line)) kind = "heading";
    else if (STRUCTURAL.some((re) => re.test(line))) kind = "structural";
    // 리스트 항목에 딸린 들여쓴 줄은 그 항목의 일부로 둔다.
    else if (
      prev === "structural" &&
      pendingBlanks === 0 &&
      /^\s{2,}/.test(line)
    )
      kind = "structural";

    // 글 맨 앞과 제목 바로 아래의 빈 줄은 빈 문단으로 만들지 않는다.
    const emptyParagraphs =
      prev === null || prev === "heading" ? 0 : pendingBlanks;
    for (let i = 0; i < emptyParagraphs; i++) {
      separate();
      out.push(EMPTY_PARAGRAPH_MARKER);
    }

    // 이어지는 표·리스트·인용 줄은 한 블록이므로 붙여 둔다.
    const continuesBlock =
      kind === "structural" && prev === "structural" && pendingBlanks === 0;
    if (!continuesBlock) separate();

    out.push(line);
    if (kind === "code") inFence = true;
    prev = kind;
    pendingBlanks = 0;
  }

  return out.join("\n");
}

export const isEmptyParagraphMarker = (text: string) =>
  text.trim() === EMPTY_PARAGRAPH_MARKER;
