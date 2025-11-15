import { useEffect, useRef, useState } from "react";
import Modal from ".";

import Image from "next/image";
import { cn } from "@/utils/cn";
import { TfiClose } from "react-icons/tfi";
import { ButtonBase } from "@/components/common";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import playItems from "@/app/[locale]/play/playItemsData";
import { usePauseScroll } from "@/hooks/useLenis";

interface ExpandModalProps {
  id: number;

  onResolve: (value?: boolean) => void;
  canNotEscape: boolean;
}

export default function ExpandModal({
  id,
  onResolve,
  canNotEscape = false,
}: ExpandModalProps) {
  const [open, setOpen] = useState(true);
  const [currentId, setCurrentId] = useState(id);
  const [imageLoading, setImageLoading] = useState(false);
  // const [loadedImages, setLoadedImages] = useState(new Set());

  const contentsRef = useRef<null | HTMLDivElement>(null);

  // 끄기 함수
  const handleClose = () => {
    document.body.style.overflow = "unset";
    setOpen(false);
    onResolve();
  };

  const dimRef = useRef<HTMLDivElement | null>(null);
  let targetItem = playItems.find((item) => item && item.id === currentId);

  const handleChangeContents = async (
    e: React.MouseEvent | React.KeyboardEvent | KeyboardEvent,
    direction: "prev" | "next",
  ) => {
    e.stopPropagation();
    const isPrev = direction === "prev";

    const changableItem = playItems.find(
      (item) => item && item.id === currentId + (isPrev ? -1 : 1),
    );

    if (changableItem) {
      setImageLoading(true);

      // 새 이미지들이 모두 로드될 때까지 대기
      // const preloadPromises = changableItem.items.map((item) =>
      //   preloadImage(item.imgUrl),
      // );

      try {
        // Nest.js에서 많이 쓰는 패턴.
        // map으로 비동기 함수 리턴문 배열로 만들어 Promise.All에 제공.
        // await Promise.all(preloadPromises);
        setCurrentId(changableItem.id);
      } catch (error) {
        console.error("Image preload failed:", error);
        // 실패해도 이미지 변경은 진행
        setCurrentId(changableItem.id);
      } finally {
        setImageLoading(false);
      }
    }
  };

  // 이상한 아이디 이미지면 바로 끄기
  useEffect(() => {
    console.log(targetItem, "targetItem");
    if (!targetItem) handleClose();
    // eslint-disable-next-line
  }, [targetItem]);

  // 키보드 이동 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log(e, "keydown");
      if (e.key === "Escape" && !canNotEscape) {
        handleClose();
      }

      if (e.key === "ArrowRight") {
        handleChangeContents(e, "prev");
      }

      if (e.key === "ArrowLeft") {
        handleChangeContents(e, "next");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line
  }, [canNotEscape, currentId]);

  // Lenis 임시 끄기 & 다시 활성화
  usePauseScroll();

  // 이미지 프리로드 함수
  // const preloadImage = (imgUrl: string): Promise<void> => {
  //   return new Promise((resolve, reject) => {
  //     // 이미 로드된거면 리턴
  //     if (loadedImages.has(imgUrl)) {
  //       resolve();
  //       return;
  //     }

  //     // HTML에 조립되지 않아도 일단 이미지 객체로 만들고 src 연결만 하면 캐싱되는 원리
  //     const img = new window.Image();
  //     img.onload = () => {
  //       // img.src에 url이 할당되어야 시작
  //       setLoadedImages((prev) => new Set(prev).add(imgUrl));
  //       resolve();
  //     };
  //     img.onerror = reject;
  //     img.src = imgUrl;
  //   });
  // };

  // 인접한 이미지들 프리로드
  // useEffect(() => {
  // const currentIndex = playItems.findIndex((item) => item?.id === currentId);
  // const preloadPromises: Promise<void>[] = [];

  // 현재, 이전, 다음 이미지 프리로드
  // [-1, 0, 1].forEach((offset) => {
  //   const targetIndex = currentIndex + offset;
  //   const targetItem = playItems[targetIndex];

  //   if (targetItem?.items) {
  //     targetItem.items.forEach((item) => {
  //       preloadPromises.push(preloadImage(item.imgUrl));
  //     });
  //   }
  // });

  // Promise.all(preloadPromises).catch(console.error);
  // eslint-disable-next-line
  // }, [currentId, loadedImages]);

  const buttonClassName = cn(
    "fixed bottom-0 top-0 z-[100] m-auto h-fit w-fit rounded-xl p-1",
    imageLoading
      ? "opacity-50 cursor-not-allowed"
      : "hover:bg-gray-100/10 cursor-pointer",
  );
  if (!targetItem) {
    return <></>;
  }

  const {
    // id,
    title,
    content,
    items,
    thumnail,
    createdAt,
    isVisible,
    isCentered,
    imageOnly,
    containerClassName,
    fill,
    objectFit,
    maxWidth,
  } = targetItem;

  return (
    <Modal
      open={open}
      // onClose={() => handleUnmountAnimation(handleClose)}
      onClose={() => handleClose()}
      canNotEscape={canNotEscape}
      ref={dimRef}
    >
      <div className="relative flex h-[100vh] w-full justify-center overflow-y-auto">
        {/* CLOSE_BUTTON */}
        <ButtonBase
          className="fixed right-10 top-10"
          onClick={() => {
            handleClose();
          }}
        >
          <TfiClose
            className="rounded-lg p-1 text-gray-200 transition-all hover:bg-gray-5/10"
            size={32}
          />
        </ButtonBase>

        {/* CONTENTS */}
        <div
          ref={contentsRef}
          className={cn(
            "flex h-fit flex-col items-center gap-3 py-20",
            isCentered && "flex h-full flex-col justify-center",
            containerClassName,
          )}
          onClick={(e) => {
            e.stopPropagation();
          }}
          style={{ maxWidth: maxWidth ?? "60%" }}
        >
          {items.map((item) => {
            return (
              <div key={item.title}>
                <Image
                  className={cn("flex-1", imageLoading && "opacity-30")}
                  src={item.imgUrl}
                  width={!fill ? item.width : undefined}
                  height={!fill ? item.height : undefined}
                  alt={item.title ?? "galleryImage"}
                  fill={fill}
                  objectFit={objectFit}
                  style={{ aspectRatio: `${item.width} / ${item.height}` }}
                  placeholder={item.placeholder ? "blur" : undefined}
                />
              </div>
            );
          })}

          {/* {imageLoading && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/20">
              <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-white"/>
            </div>
          )} */}

          {!imageOnly && (
            <div className="flex w-full flex-col items-center">
              <span className="text-white">{title}</span>
              <span className="text-gray-100">{content}</span>
            </div>
          )}
        </div>

        {/* 이전/다음 */}
        <ButtonBase
          onClick={(e) => handleChangeContents(e, "next")}
          className={cn(buttonClassName, "left-[10%]")}
        >
          <BsChevronLeft className="text-white" size={32} />
        </ButtonBase>

        <ButtonBase
          onClick={(e) => handleChangeContents(e, "prev")}
          className={cn(buttonClassName, "right-[10%]")}
        >
          <BsChevronRight className="text-white" size={32} />
        </ButtonBase>
      </div>
    </Modal>
  );
}

ExpandModal.displayName = "ExpandModal";
