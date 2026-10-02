"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { LuPlaneTakeoff as PublishPlaneIcon } from "react-icons/lu";
import { getButtonColorStyle } from "@/utils/styles/filButtonManager";
import { Tag, ReadPermissionSelector } from "../../../../common";
import { RoleType } from "@/types";
import { cn } from "@/utils/cn";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { PATHNAME } from "@/constants/routes/pathnameRoutes";
import {
  postCreatePost,
  patchUpdatePost,
  postUploadExternalImage,
} from "@/services/api/blog/edit";
import { isAxiosError } from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useEditStore } from "@/store/edit";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getThumbnailByGroup } from "@/utils/getThumnailByGroup";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CreatePostDto } from "@/types/dto/blog/edit";
import { useTranslations } from "next-intl";
import { useBlogEditorContext } from "@/contexts/BlogEditorContext";

export function PublishDrawer() {
  // Context에서 모든 값 가져오기
  const {
    title,
    editor,
    selectedGroup,
    selectedCategory,
    selectedTags,
    onSerialize,
    onDisablePrevent,
    blockAudienceMap,
  } = useBlogEditorContext();

  // const editorValue = onSerialize();
  const t = useTranslations("blogEdit.publish");
  const { fillStyle: DarkFillStyle, textStyle: DarkTextStyle } =
    getButtonColorStyle("dark");

  const { user } = useAuth();
  const editDraft = useEditStore((state) => state.editDraft);

  const params = useSearchParams();
  const queryId = params.get("id");

  const [readPermission, setReadPermission] = useState<RoleType>(
    queryId && editDraft?.readPermission !== undefined
      ? editDraft.readPermission
      : null,
  );
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [previewText, setPreviewText] = useState("");

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);

  const router = useRouter();

  // 생성(POST) 요청의 멱등 키. 자동 재시도/사용자 재클릭 시에도 동일한 키를 보내
  // 백엔드가 중복 글을 만들지 않도록 한다. 한 번 만든 키는 일부러 리셋하지 않는다.
  const createRequestIdRef = useRef<string | null>(null);

  // 성공 후 이동. router 전환이 실패하는 환경(오래 열어둔 탭에서 빌드 불일치 등)을
  // 대비해, 잠시 후에도 에디터에 그대로면 하드 네비게이션으로 폴백한다.
  const navigateAfterSuccess = useCallback(
    (targetUrl: string) => {
      setIsLoading(false);
      router.replace(targetUrl);
      window.setTimeout(() => {
        if (window.location.pathname.includes("/blog/edit")) {
          window.location.assign(targetUrl);
        }
      }, 2000);
    },
    [router],
  );

  // mutation 공통 에러 핸들러
  const handleMutationError = useCallback(
    (fallbackMessage: string) => (error: unknown) => {
      setIsLoading(false);

      if (!isAxiosError(error)) {
        toast.error(fallbackMessage);
        console.error("Non-axios mutation error:", error);
        return;
      }

      // 응답 자체가 없으면(timeout / 네트워크 단절) 서버엔 이미 반영됐을 수 있다.
      if (!error.response) {
        toast.error(
          "응답이 지연되고 있어요. 변경사항이 저장됐을 수 있으니 블로그에서 확인해 주세요.",
        );
        console.error("No response (timeout/network):", error.code, error.message);
        return;
      }

      const errorMessage = error.response.data?.message || fallbackMessage;
      toast.error(errorMessage);
      console.error(
        "Mutation error:",
        error.response.status,
        error.response.config?.data,
      );
    },
    [],
  );

  const postMutation = useMutation({
    mutationFn: postCreatePost,
    onSuccess: () => {
      console.log("Post created successfully!");
      toast.success("Post published successfully!");
      navigateAfterSuccess(PATHNAME.BLOG);
    },
    onError: handleMutationError("Failed to publish post"),
  });

  // 수정 모드일 때 기존 readPermission 값 로드
  useEffect(() => {
    if (queryId && editDraft?.readPermission !== undefined) {
      setReadPermission(editDraft.readPermission);
    }
  }, [queryId, editDraft]);

  const updateMutation = useMutation({
    mutationFn: ({ queryId, ...rest }: CreatePostDto & { queryId: string }) =>
      patchUpdatePost(queryId, rest),
    onSuccess: (_data, variables) => {
      console.log("Post updated successfully!");
      toast.success("Post updated successfully!");
      navigateAfterSuccess(PATHNAME.BLOG + `/${variables.queryId}`);
    },
    onError: handleMutationError("Failed to update post"),
  });

  const handleChangeThumbnailIndex = (value: -1 | 1) => {
    setThumbnailIndex((prev) =>
      value === -1
        ? Math.max(prev + value, 0)
        : Math.min(prev + value, thumbnails.length - 1),
    );
  };

  // BlockNote content의 앞뒤 빈 블록 제거
  const trimBlockNoteContent = (blocks: any) => {
    if (!blocks || blocks.length === 0) return blocks;

    let start = 0;
    let end = blocks.length - 1;

    // 앞에서부터 빈 블록 찾기
    while (start < blocks.length && isEmptyBlock(blocks[start])) {
      start++;
    }

    // 뒤에서부터 빈 블록 찾기
    while (end >= 0 && isEmptyBlock(blocks[end])) {
      end--;
    }

    if (start > end) return []; // 모든 블록이 빈 경우

    return blocks.slice(start, end + 1);
  };

  const isEmptyBlock = (block: any): boolean => {
    if (block.type === "paragraph") {
      const content = block.content;
      if (!content || content.length === 0) return true;
      if (Array.isArray(content)) {
        return content.every(
          (item: any) => !item.text || item.text.trim() === "",
        );
      }
    }
    return false;
  };

  // PUBLISH!!
  const handlePublish = () => {
    // BlockNote content를 직렬화
    const content = onSerialize();
    const trimmedContent = trimBlockNoteContent(content);
    const serializedHTML = trimmedContent
      ? JSON.stringify(trimmedContent)
      : undefined;
    const categoryId = selectedCategory?.id;
    const tagIds = selectedTags.map((item) => item.id);
    const thumbnailUrl = thumbnails[thumbnailIndex];

    // 전후 공백 제거
    const trimmedTitle = title.trim();
    const trimmedPreviewText = previewText.trim();

    // 로그인을 안 했을 때
    if (!user?.role) {
      toast.error("You didn't login.");
      return;
    }

    // 카테고리 미선택 시
    if (categoryId === undefined) {
      toast.error("Category and Group needed, Me!");
      return;
    }

    // 타이틀 미입력 시
    if (!trimmedTitle) {
      toast.error("Write Some Title, Me!");
      return;
    }

    // 본문 미입력 시
    if (!serializedHTML || !trimmedPreviewText) {
      toast.error("Write Some Contents, Me!");
      return;
    }

    setIsLoading(true);
    onDisablePrevent();

    const payload: CreatePostDto = {
      title: trimmedTitle,
      content: serializedHTML,
      previewText: trimmedPreviewText,
      categoryId,
      tagIds,
      readPermission,
      thumbnailUrl,
      blockAudienceMap,
    };

    // 성공 시 redirect / 에러 처리는 각 mutation의 onSuccess/onError 콜백에서 담당한다.
    if (queryId) {
      updateMutation.mutate({ queryId, ...payload });
      return;
    }

    // 생성: 멱등 키를 최초 1회만 만들어 이후 재시도에도 동일하게 보낸다.
    if (!createRequestIdRef.current) {
      createRequestIdRef.current = crypto.randomUUID();
    }
    postMutation.mutate({
      ...payload,
      clientRequestId: createRequestIdRef.current,
    });
  };

  // 외부 URL 이미지를 S3로 업로드 (프록시 API 사용)
  const uploadExternalImage = useCallback(
    async (url: string): Promise<string> => {
      try {
        console.log("🔄 Uploading external image via proxy:", url);
        const response = await postUploadExternalImage(url);
        console.log(
          "✅ External image uploaded:",
          url,
          "→",
          response.publicUrl,
        );
        return response.publicUrl;
      } catch (error) {
        console.error("❌ Failed to upload external image:", url, error);
        return url; // 실패 시 원본 URL 유지
      }
    },
    [],
  );

  // S3 URL인지 확인
  const isS3Url = (url: string) => {
    return url.includes(
      "bumang-blog-s3-storage.s3.ap-northeast-2.amazonaws.com",
    );
  };

  // 외부 이미지를 S3로 업로드하고 에디터 업데이트
  const uploadExternalImagesAndUpdateEditor = useCallback(async () => {
    if (!editor) return;

    const blocks = editor.document;
    let hasExternalImages = false;

    // 외부 이미지 찾기
    for (const block of blocks) {
      if (block.type === "image" && block.props?.url) {
        const url = block.props.url as string;
        if (!isS3Url(url)) {
          hasExternalImages = true;
          console.log("🔄 Uploading external image:", url);

          // 외부 이미지를 S3로 업로드
          const newUrl = await uploadExternalImage(url);

          // 에디터에서 URL 업데이트
          if (newUrl !== url) {
            editor.updateBlock(block, {
              type: "image",
              props: { ...block.props, url: newUrl },
            });
          }
        }
      }
    }

    if (hasExternalImages) {
      console.log("✅ All external images uploaded");
    }
  }, [editor, uploadExternalImage]);

  // BlockNote에서 이미지와 텍스트 추출
  const getImages = useCallback((): string[] => {
    if (!editor) return [];

    const imageUrls: string[] = [];
    const blocks = editor.document;

    console.log("🔍 All blocks:", blocks);

    blocks.forEach((block) => {
      console.log("📦 Block type:", block.type, "Props:", block.props);
      if (block.type === "image" && block.props?.url) {
        imageUrls.push(block.props.url as string);
      }
    });

    console.log("🖼️ Found images:", imageUrls);
    return imageUrls;
  }, [editor]);

  const getPreviewText = useCallback((): string => {
    if (!editor) return "";

    let text = "";
    const blocks = editor.document;

    blocks.forEach((block) => {
      if (block.type === "paragraph" || block.type === "heading") {
        const content = block.content;
        if (Array.isArray(content)) {
          content.forEach((item) => {
            if (item.type === "text" && item.text) {
              text += item.text + " ";
            }
          });
        }
      }
    });

    return text.trim();
  }, [editor]);

  useEffect(() => {
    const processImages = async () => {
      if (open) {
        // 1. 외부 이미지를 S3로 업로드하고 에디터 업데이트
        await uploadExternalImagesAndUpdateEditor();

        // 2. 썸네일과 미리보기 텍스트 설정
        setThumbnails(getImages());
        setPreviewText(getPreviewText().slice(0, 200));
      }
    };

    processImages();
  }, [open, getImages, getPreviewText, uploadExternalImagesAndUpdateEditor]);

  // 로딩 상태 확인
  const isActionLoading =
    isLoading || postMutation.isPending || updateMutation.isPending;

  return (
    <Drawer
      onOpenChange={(e) => {
        setOpen(e);
      }}
    >
      {/* TRIGGER */}
      <DrawerTrigger asChild className="ml-8">
        <Button
          variant="outline"
          className={cn(DarkFillStyle, "flex items-center")}
        >
          <PublishPlaneIcon className={DarkTextStyle} />
          <span className={DarkTextStyle}>
            {queryId ? t("button.update") : t("button.publish")}
          </span>
          {queryId && (
            <span className="text-xs text-primary-foreground">
              id: {queryId}
            </span>
          )}
        </Button>
      </DrawerTrigger>

      {/* CONTENT */}
      <DrawerContent>
        <div className="mx-auto w-full max-w-4xl">
          <DrawerHeader className="mb-6">
            <DrawerTitle>{t("title")}</DrawerTitle>
            <DrawerDescription>{t("desc")}</DrawerDescription>
          </DrawerHeader>

          <div className="flex gap-4 px-4">
            {/* Thumbnail */}
            <div className="relative flex aspect-video h-full flex-1 items-center justify-center overflow-hidden rounded-lg bg-secondary text-gray-200">
              {thumbnails.length > 0 || selectedGroup ? (
                <Image
                  src={
                    thumbnails?.[thumbnailIndex] ??
                    getThumbnailByGroup(
                      selectedGroup?.label ?? "",
                      "blogItem",
                    ) ??
                    ""
                  } // thumbnails
                  alt="thumbnail Image"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-1">
                  {t("noImage")}
                </div>
              )}

              {thumbnails.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 h-8 w-8 shrink-0 rounded-full"
                  onClick={() => handleChangeThumbnailIndex(-1)}
                  disabled={false}
                >
                  <ArrowLeft />
                  <span className="sr-only">Decrease</span>
                </Button>
              )}

              {thumbnails.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 h-8 w-8 shrink-0 rounded-full"
                  onClick={() => handleChangeThumbnailIndex(1)}
                  disabled={false}
                >
                  <ArrowRight />
                  <span className="sr-only">Increase</span>
                </Button>
              )}
            </div>

            {/* Information */}
            <div className="flex flex-1 flex-col">
              <div className="flex-1">
                {/* TITLE */}
                <h1
                  className={cn(
                    "text-xl font-semibold tracking-tighter",
                    !title && "text-red-500",
                  )}
                >
                  {title ? title : t("noTitle")}
                </h1>

                {/* DESC */}
                <span
                  className={cn(!previewText && "font-medium text-red-500")}
                >
                  {previewText ? previewText : t("noDesc")}
                </span>

                {/* GROUP/CATEGORY */}
                <div className="flex gap-1 text-sm text-gray-200">
                  <span
                    className={cn(
                      !selectedGroup?.label && "font-bold text-red-500",
                    )}
                  >
                    {selectedGroup?.label ? selectedGroup.label : t("noGroup")}
                  </span>

                  <span>•</span>

                  <span
                    className={cn(
                      !selectedCategory?.label && "font-bold text-red-500",
                    )}
                  >
                    {selectedCategory?.label
                      ? selectedCategory.label
                      : t("noCategory")}
                  </span>
                </div>

                {/* TAGS */}
                <div className="pointer-events-none mt-3 flex gap-2">
                  {selectedTags.map((item) => {
                    return (
                      <Tag
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        className="w-fit"
                      />
                    );
                  })}
                </div>
              </div>

              <ReadPermissionSelector
                value={readPermission}
                onChange={setReadPermission}
                userRole={(user?.role as "member" | "guest") ?? null}
              />
            </div>
          </div>
          <DrawerFooter>
            <Button
              onClick={handlePublish}
              isLoading={isActionLoading}
              loadingText={queryId ? "Updating..." : "Publishing..."}
            >
              {t("submit")}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" disabled={isActionLoading}>
                {t("cancel")}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// const getFirstImageUrl = (): string | undefined => {
//   const data = editor.getEditorValue();
//   const values = Object.values(data);
//   const target = values.find((item) => item.type === "Image");
//   const image: string | undefined = (target?.value?.[0] as SlateElement)
//     ?.props?.src;

//   return image;
// };
