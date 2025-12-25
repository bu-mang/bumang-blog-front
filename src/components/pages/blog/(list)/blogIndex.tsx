"use client";

import { ButtonBase } from "@/components/common";
import type { BlogHeadingComponentType, BlogHeadingType } from "@/types";
import { cn } from "@/utils/cn";
import { useEffect, useRef, useState } from "react";

interface BlogIndexProps {
  onStart: boolean;
}

/**
 * @포스팅_옆_목차_컴포넌트
 */
const BlogIndex = ({ onStart }: BlogIndexProps) => {
  const [headings, setHeadings] = useState<BlogHeadingComponentType[]>([]);
  const [activeId, setActiveId] = useState<string>();
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // 글의 h1, h2, h3 태그 파싱
    const headingElements = Array.from(document.querySelectorAll("h1, h2, h3"))
      .filter((el) => el.id) // id 없는 요소 제외
      .map((el) => ({
        id: el.id,
        // text: el.textContent || "",
        text: el.textContent || "",
        level: Number(el.tagName.charAt(1)), // h1, h2, h3 -> 숫자로 변환
      }));

    // Intersection Observer 설정
    observer.current = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) setActiveId(visibleEntry.target.id);
      },
      { rootMargin: "-50px 0px -60% 0px", threshold: 0.1 },
    );

    headingElements.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.current?.observe(element);
    });
    setHeadings(headingElements);

    return () => observer.current?.disconnect();
  }, [onStart]);

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const [isVisible, setIsVisible] = useState(true); // 가시성 상태 추가
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;

      // 하단 20% 영역에 도달했는지 확인
      const scrollPercentage = (scrollTop + windowHeight) / documentHeight;
      setIsVisible(scrollPercentage < 0.8); // 80% 지점까지만 보이기
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [marginBottom, setMarginBottom] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { height } = entry.contentRect;

        console.log(height, "height");

        if (height <= 500 && height > 0) {
          const targetMargin = (window.innerHeight - height) / 2;
          setMarginBottom(targetMargin);
        }

        if (height > 500) {
          const targetMargin = 50;
          setMarginBottom(targetMargin);
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed hidden h-fit w-[17vw] flex-col gap-2.5 border-l-[2px] transition-opacity duration-300 ease-out lg:flex",
        isVisible ? "opacity-100" : "opacity-0",
      )}
      style={{ bottom: marginBottom }}
    >
      {headings.map((heading) => (
        <ButtonBase
          key={heading.id}
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
  );
};

export default BlogIndex;
