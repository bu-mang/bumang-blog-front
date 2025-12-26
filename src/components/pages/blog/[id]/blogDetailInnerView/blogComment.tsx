"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/utils/cn";

const BlogComment = () => {
  const COMMENTS_ID = "comment-container";
  const commentRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { resolvedTheme } = useTheme();

  // utterance 초기화
  useEffect(() => {
    if (commentRef.current) {
      const utterancesSettings = {
        src: "https://utteranc.es/client.js",
        repo: "bu-mang/bumang-blog-comments",
        "issue-term": "pathname",
        theme: resolvedTheme === "dark" ? "github-dark" : "github-light",
        crossorigin: "anonymous",
        async: "true",
      };

      const utterances = document.createElement("script");

      Object.entries(utterancesSettings).forEach(([key, value]) => {
        utterances.setAttribute(key, value);
      });

      utterances.onload = (_event) => {
        const comments = document.getElementById(COMMENTS_ID);
        // for some reason it shows two comment elements, this is to hide second one.
        if (comments && comments.children[1]) {
          // @ts-ignore
          comments.children[1].style.display = "none";
        }
      };

      commentRef.current.appendChild(utterances);
    }

    setIsLoading(false);
    // eslint-disable-next-line
  }, []);

  // 2) 테마 변경은 postMessage로만 처리 (재주입 금지)
  useEffect(() => {
    const iframe = document.querySelector<HTMLIFrameElement>(
      "iframe.utterances-frame",
    );
    if (!iframe) return;
    iframe.contentWindow?.postMessage(
      {
        type: "set-theme",
        theme: resolvedTheme === "dark" ? "github-dark" : "github-light",
      },
      "https://utteranc.es",
    );
  }, [resolvedTheme]);

  return (
    <div
      className={cn(
        "utterances-frame relative col-start-1 col-end-12 min-h-40 rounded-xl px-5 lg:col-start-2 lg:col-end-10 xl:col-start-3 xl:col-end-9",
        "bg-gray-1 dark:bg-gray-800",
      )}
      id={COMMENTS_ID}
      ref={commentRef}
    >
      {isLoading && <div>로딩중</div>}
    </div>
  );
};

export default BlogComment;
