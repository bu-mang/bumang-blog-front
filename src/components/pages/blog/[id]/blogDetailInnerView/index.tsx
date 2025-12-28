"use client";

import {
  ButtonBase,
  Divider,
  FillButton,
  Tag,
  TagWrapper,
} from "@/components/common";
import { PostDetailResponseDto } from "@/types/dto/blog/[id]";
import { BlockNoteSchema, createCodeBlockSpec } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { codeBlockOptions } from "@blocknote/code-block";
import { useTheme } from "next-themes";
import { format } from "date-fns";
import {
  AlignJustifyIcon,
  Calendar,
  Edit,
  FolderIcon,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import BlogIndex from "../../(list)/blogIndex";
import BlogComment from "./blogComment";
import RelatedAndAdjacentPost from "./relatedPosts";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useRouter } from "next/navigation";
import { PATHNAME } from "@/constants/routes/pathnameRoutes";
import { getThumbnailByGroup } from "@/utils/getThumnailByGroup";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/store/auth";
import { useEditStore } from "@/store/edit";
import { useMutation } from "@tanstack/react-query";
import { deletePost } from "@/services/api/blog/edit";
import { useTranslations } from "next-intl";
import { useHeaderStore } from "@/store/header";
import { parseBlockNoteContent } from "@/utils/contentFormat";
import useModalStore from "@/store/modal";
import CommonModal from "@/components/modal/type/common";

interface BlogDetailInnerProps {
  post: PostDetailResponseDto;
}

/**
 * @BLOG_INNER_VIEW
 */

export function BlogDetailInnerViewFallback({
  isError,
}: {
  isError?: boolean;
}) {
  const router = useRouter();

  if (isError) {
    return (
      <div className="col-span-full flex h-96 flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <Image
            src={"/401.png"}
            alt="Unauthenticated Error Image"
            width={324}
            height={127}
            className="pointer-events-none"
            placeholder="blur"
          />
          <div className="mb-5 mt-3 text-xl font-semibold">OopseyDaisies!</div>
          <div className="text-lg font-medium">This is Private Article.</div>
          <div className="mb-8">It seems You are not logged in</div>
        </div>
        <div className="flex gap-5">
          <ButtonBase
            onClick={() => router.push(PATHNAME.HOME)}
            className="text-gray-500 hover:text-gray-800 hover:underline"
          >
            ← Back to Home
          </ButtonBase>
          <FillButton
            className="text-white"
            onClick={() => router.push(PATHNAME.LOGIN)}
          >
            Go To Login
          </FillButton>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 본문 ARTICLE */}
      <div className="col-start-3 col-end-9 mb-10 flex h-fit flex-col justify-center gap-x-[1.5vw]">
        <TagWrapper as="collapsible" align="center">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </TagWrapper>

        <div className="mb-10 mt-4 flex flex-col items-center justify-center gap-4 text-center text-6xl font-semibold leading-tight">
          <Skeleton className="h-16 w-full max-w-[600px]" />
          <Skeleton className="h-16 w-full max-w-[1000px]" />
        </div>

        <div className="mb-12 flex items-center justify-center">
          <div className="group flex cursor-pointer items-center justify-center gap-2 text-sm text-gray-300 transition-all hover:scale-105">
            <Skeleton className="h-5 w-5" />
            <span className="group-hover:text-gray-600">
              <Skeleton className="h-5 w-24" />
            </span>
          </div>

          <span className="mx-2 text-gray-200">•</span>

          <div className="group flex cursor-pointer items-center justify-center gap-2 text-sm text-gray-300 transition-all hover:scale-105">
            <Skeleton className="h-5 w-5" />
            <span className="group-hover:text-gray-600">
              <Skeleton className="h-5 w-24" />
            </span>
          </div>

          <Divider className="mx-5" />

          <div className="pointer-events-none flex items-center justify-center gap-2 text-sm text-gray-300">
            <Skeleton className="h-5 w-5" />
            <span>
              <Skeleton className="h-5 w-24" />
            </span>
          </div>
        </div>

        <div className="relative mb-14 aspect-video w-full overflow-hidden rounded-2xl shadow-md">
          <Skeleton className="h-full w-full" />
        </div>

        <div className="mb-4 flex">
          <Skeleton className="mr-4 h-16 w-16 shrink-0 rounded-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>

      {/* <RelatedAndAdjacentPost id={post.id} /> */}
    </>
  );
}

export default function BlogDetailInnerView({ post }: BlogDetailInnerProps) {
  const t = useTranslations("blogDetail");

  // Theme
  const { theme } = useTheme();

  // 헤더 상태 초기화
  const setDefaultSetting = useHeaderStore((state) => state.setDefaultSetting);
  useEffect(() => {
    setDefaultSetting();
    // eslint-disable-next-line
  }, []);

  /**
   * EDITOR_LOGIC
   */
  const [indexParsed, setIndexParsed] = useState(false);
  const user = useAuthStore((state) => state.user);
  const setAllEditState = useEditStore((state) => state.setAllEditState);

  // Parse BlockNote content
  const blockNoteContent = useMemo(() => {
    return parseBlockNoteContent(post.content);
  }, [post.content]);

  // Create BlockNote editor
  const editor = useCreateBlockNote({
    schema: BlockNoteSchema.create().extend({
      blockSpecs: {
        codeBlock: createCodeBlockSpec({
          ...codeBlockOptions,
          defaultLanguage: "typescript",
          supportedLanguages: {
            typescript: { name: "TypeScript", aliases: ["ts"] },
            javascript: { name: "JavaScript", aliases: ["js"] },
            python: { name: "Python", aliases: ["py"] },
            java: { name: "Java", aliases: [] },
            markdown: { name: "Markdown", aliases: ["md"] },
          },
        }),
      },
    }),
    initialContent: blockNoteContent,
  });

  // 파싱 완료 표시
  useEffect(() => {
    if (blockNoteContent && blockNoteContent.length > 0) {
      setIndexParsed(true);
    }
  }, [blockNoteContent]);

  const handleSetDraft = () => {
    setAllEditState(
      post.id,
      {
        title: post.title,
        content: blockNoteContent,
        selectedGroup: post.group,
        selectedCategory: post.category,
        selectedTags: post.tags,
        readPermission: post.readPermission,
      },
      "toUpdate",
    );
  };

  const openModal = useModalStore((state) => state.openModal);

  const handleDelete = async () => {
    const confirmed = await openModal(CommonModal, {
      title: t("deleteConfirmTitle") || "포스트 삭제",
      desc:
        t("deleteConfirmDesc") ||
        "정말 삭제하시겠습니까?\n삭제된 포스트는 복구할 수 없습니다.",
      proceedLabel: t("deleteConfirmButton") || "삭제",
      dismissLabel: t("cancel") || "취소",
    });

    if (confirmed) {
      deleteMutation.mutateAsync();
    }
  };

  const router = useRouter();
  const params = useParams();
  const queryId = typeof params.id === "string" ? params.id : params.id[0];
  const deleteMutation = useMutation({
    mutationFn: () => deletePost(queryId),
    onSuccess: () => {
      router.back();
    },
  });

  return (
    <>
      {/* 본문 ARTICLE */}
      <div className="col-start-1 col-end-12 mb-10 flex h-fit flex-col justify-center gap-x-[1.5vw] lg:col-start-3 lg:col-end-9 xl:col-start-3 xl:col-end-9">
        <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-2xl">
          <Image
            alt="Thumnail"
            src={
              post?.thumbnailUrl ||
              getThumbnailByGroup(post.group.label, "postBanner")
            }
            className="bg-gray-100 object-cover object-top"
            priority
            fill
          />
        </div>

        <TagWrapper as="collapsible" align="center" className="">
          {post?.tags.length ? (
            post.tags.map((tag) => (
              <Tag type="button" id={tag.id} title={tag.label} key={tag.id} />
            ))
          ) : (
            <Tag id={0} title={t("noTag")} className="pointer-events-none" />
          )}
        </TagWrapper>

        <div
          className="mb-1 text-center text-2xl font-semibold md:text-5xl"
          style={{ lineHeight: 1.4 }}
        >
          {post.title}
        </div>

        {/* INFORMATIONS */}
        <div className="mb-4 flex flex-wrap items-center justify-center">
          <div className="group flex cursor-pointer items-center justify-center gap-2 text-sm text-gray-300 transition-all hover:scale-105">
            <FolderIcon size={18} className="group-hover:text-gray-600" />
            <Link
              href={PATHNAME.BLOG + `?groupId=${post.group.id}`}
              className="group-hover:text-gray-600"
            >
              {post.group.label ?? "No Group"}
            </Link>
          </div>

          <span className="mx-2 text-gray-200">•</span>

          <div className="group flex cursor-pointer items-center justify-center gap-2 text-sm text-gray-300 transition-all hover:scale-105">
            <AlignJustifyIcon size={18} className="group-hover:text-gray-600" />
            <Link
              href={PATHNAME.BLOG + `?categoryId=${post.category.id}`}
              className="group-hover:text-gray-600"
            >
              {post.category.label ?? "No Category"}
            </Link>
          </div>

          <Divider className="mx-5" />

          {/* CALENDAR */}
          <div className="pointer-events-none flex items-center justify-center gap-2 text-sm text-gray-300">
            <Calendar size={18} />
            <span>{format(post.createdAt, "yyyy. MM. dd.")}</span>
          </div>

          {/* LOGGINED */}
          {(post.authorNickname === user?.nickname ||
            user?.role === "admin") && (
            <div className="hidden gap-2 md:flex">
              <Divider className="mx-5" />

              <Link
                className="mr-5 flex items-center gap-1 text-sm text-gray-300 hover:underline"
                href={PATHNAME.BLOG + `/edit?id=${post.id}`}
                onClick={handleSetDraft}
              >
                <Edit size={18} />
                <span>{t("edit")}</span>
              </Link>

              <ButtonBase
                className="flex items-center gap-1 text-sm text-gray-300 hover:underline"
                onClick={handleDelete}
              >
                <Trash2 size={18} />
                <span>{t("delete")}</span>
              </ButtonBase>
            </div>
          )}
        </div>

        <BlockNoteView
          editor={editor}
          theme={theme === "dark" ? "dark" : "light"}
          editable={false}
        />
      </div>

      {/* 목차 */}
      <div className="relative col-start-9 col-end-11">
        <BlogIndex onStart={indexParsed} />
      </div>

      {/* 댓글 */}
      <BlogComment />

      <RelatedAndAdjacentPost id={post.id} />
    </>
  );
}
