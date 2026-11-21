"use client";

import { ButtonBase } from "@/components/common";
import type { BlogHeadingComponentType, BlogHeadingType } from "@/types";
import { cn } from "@/utils/cn";
import { useEffect, useRef, useState } from "react";

interface BlogIndexProps {
  onStart?: boolean;
}

/**
 * @포스팅_옆_목차_컴포넌트
 */
const BlogIndex = ({ onStart = true }: BlogIndexProps) => {
  const [headings, setHeadings] = useState<BlogHeadingComponentType[]>([]);
  const [activeId, setActiveId] = useState<string>();
  const observer = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // BlockNote가 렌더링될 때까지 기다렸다가 heading 파싱
    const parseHeadings = () => {
      // BlockNote의 heading 구조 파싱
      // div[data-content-type="heading"][data-level="1,2,3"]의 부모 div[data-id]를 찾음
      const headingDivs = Array.from(
        document.querySelectorAll('div[data-content-type="heading"]'),
      );

      const headingElements = headingDivs
        .filter((div) => {
          const level = div.getAttribute("data-level");
          return level === "1" || level === "2" || level === "3";
        })
        .map((div) => {
          const parentDiv = div.parentElement;
          const id = parentDiv?.getAttribute("data-id") || "";
          const level = Number(div.getAttribute("data-level"));
          const text = div.textContent || "";

          return { id, text, level };
        })
        .filter((item) => item.id); // id가 있는 것만 필터링

      // headings가 없으면 조금 후에 다시 시도
      if (headingElements.length === 0) {
        return false;
      }

      // Intersection Observer 설정
      observer.current = new IntersectionObserver(
        (entries) => {
          const visibleEntry = entries.find((entry) => entry.isIntersecting);
          if (visibleEntry) {
            const id = visibleEntry.target.getAttribute("data-id");
            if (id) setActiveId(id);
          }
        },
        { rootMargin: "-50px 0px -60% 0px", threshold: 0.1 },
      );

      headingElements.forEach(({ id }) => {
        const element = document.querySelector(`[data-id="${id}"]`);
        if (element) {
          observer.current?.observe(element);
        }
      });
      setHeadings(headingElements);
      return true;
    };

    // 즉시 시도
    const success = parseHeadings();

    // 실패하면 100ms 후 재시도
    let retryTimer: NodeJS.Timeout | null = null;
    if (!success) {
      retryTimer = setTimeout(() => {
        parseHeadings();
      }, 100);
    }

    return () => {
      observer.current?.disconnect();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [onStart]);

  // activeId가 변경되면 해당 항목을 스크롤하여 보이게 함
  useEffect(() => {
    if (!activeId || !containerRef.current) {
      return;
    }

    const activeElement = containerRef.current.querySelector(
      `[data-heading-id="${activeId}"]`,
    ) as HTMLElement;

    if (activeElement) {
      const container = containerRef.current;
      const elementRect = activeElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // 요소의 컨테이너 내 상대 위치 계산
      const elementTopRelativeToContainer =
        elementRect.top - containerRect.top + container.scrollTop;

      // 컨테이너 중앙에 요소를 위치시키기 위한 스크롤 위치
      const targetScroll =
        elementTopRelativeToContainer -
        container.clientHeight / 2 +
        activeElement.clientHeight / 2;

      container.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    }
  }, [activeId]);

  const handleScrollTo = (id: string) => {
    const element = document.querySelector(`[data-id="${id}"]`);
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - 120;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  // 관련 포스트 영역이 나올 때 BlogIndex는 faded out 처리
  const [isVisible, setIsVisible] = useState(true); // 가시성 상태 추가
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;

      // 하단 20% 영역에 도달했는지 확인
      const scrollPercentage = (scrollTop + windowHeight) / documentHeight;
      setIsVisible(scrollPercentage < 0.9); // 90% 지점까지만 보이기
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // heading이 하나도 없으면 목차 영역(세로선·그라데이션 등) 자체를 숨긴다.
  if (headings.length === 0) return null;

  return (
    <div
      className={cn(
        "fixed hidden h-fit max-h-80 w-[17vw] transition-opacity duration-300 ease-out lg:block",
        isVisible ? "opacity-100" : "opacity-0",
      )}
    >
      {/* Top gradient fade - fixed to parent, won't scroll */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-14 bg-gradient-to-b from-background to-transparent" />

      <div className="absolute left-0 top-0 h-full w-[2px] bg-gray-50" />

      {/* Scrollable content */}
      <div
        ref={containerRef}
        className="blog-index-scroll h-full max-h-80 overflow-y-auto py-8"
      >
        <div className="flex flex-col gap-2.5">
          {headings.map((heading) => (
            <ButtonBase
              key={heading.id}
              data-heading-id={heading.id}
              className={cn(
                "flex justify-start text-start text-sm text-gray-200 transition-all hover:text-gray-700 hover:underline",
                activeId === heading.id ? "text-foreground" : "text-gray-400",
              )}
              style={{
                paddingLeft: heading.level * 10,
                scale: activeId === heading.id ? 1.01 : 1,
              }}
              onClick={() => handleScrollTo(heading.id)}
            >
              {heading.text}
            </ButtonBase>
          ))}
        </div>
      </div>

      {/* Bottom gradient fade - fixed to parent, won't scroll */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-14 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};

export default BlogIndex;
