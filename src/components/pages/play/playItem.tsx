"use client";

import ExpandModal from "@/components/modal/type/expand";
import useModalStore from "@/store/modal";
import { ImageItemType } from "@/types/playItem";
import { cn } from "@/utils/cn";
import Image, { StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";

interface PlayItemProps {
  id: number;
  title?: string;
  content?: string;
  width: number;
  height: number;
  imgUrl: StaticImageData;
  items: ImageItemType[];
  imageOnly?: boolean;
  className?: string;
  placeholder?: boolean;
}

const PlayItem = ({
  id,
  title,
  content,
  width,
  height,
  imgUrl,
  imageOnly,
  className,
  items,
  placeholder = true,
}: PlayItemProps) => {
  const textHeight = (title ? 1 : 0) + (content ? 1 : 0);
  const ref = useRef<HTMLDivElement | null>(null);

  const [containerWidth, setContainerWidth] = useState(200);

  useEffect(() => {
    if (!ref.current) return;
    const resizeRef = ref.current;

    const handleResize = () => {
      const width = resizeRef.getBoundingClientRect().width;
      setContainerWidth((width ?? 200) * 0.8);
    };

    resizeRef.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      resizeRef.removeEventListener("resize", handleResize);
    };
  }, []);

  const openModal = useModalStore((state) => state.openModal);
  const handleClick = () => {
    openModal(ExpandModal, {
      id,
    });
  };

  return (
    <button
      onClick={handleClick}
      className="group flex flex-1 animate-fade-in-up overflow-hidden rounded-sm"
    >
      <div
        ref={ref}
        className={cn(
          "relative flex aspect-square w-full flex-col items-center justify-start transition-all",
          className,
        )}
      >
        {/* IMAGE */}
        <div className={cn("relative flex w-full flex-1 transition-all")}>
          <Image
            src={imgUrl}
            alt={title ?? "GalleryImage"}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 16.67vw"
            placeholder={placeholder ? "blur" : undefined}
          />
        </div>

        {/* DESC */}
        <div
          className={cn(
            "flex-0 flex h-0 w-full flex-col overflow-hidden opacity-0 transition-all group-hover:opacity-100",
            textHeight === 1 && "group-hover:h-5",
            textHeight === 2 && "group-hover:h-10",
          )}
          style={{
            transition: "opacity 0.3s ease-in, height 0.3s ease-out",
          }}
        >
          {title && (
            <div className="flex h-5 w-full items-center justify-center text-sm">
              <span
                className="truncate text-center font-semibold"
                style={{ width: containerWidth }}
              >
                {title}
              </span>
            </div>
          )}

          {content && (
            <div className="flex h-5 w-full items-center justify-center text-sm text-gray-300">
              <span
                className="truncate text-center"
                style={{ width: containerWidth }}
              >
                {content}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default PlayItem;
