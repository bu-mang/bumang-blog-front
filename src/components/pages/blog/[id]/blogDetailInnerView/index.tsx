"use client";

import {
  ButtonBase,
  Divider,
  FillButton,
  Tag,
  TagWrapper,
} from "@/components/common";
import { PostDetailResponseDto } from "@/types/dto/blog/[id]";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import {
  AlignJustifyIcon,
  Calendar,
  Edit,
  Eye,
  FolderIcon,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import BlogIndex from "../../(list)/blogIndex";
import BlogComment from "./blogComment";
import RelatedAndAdjacentPost from "./relatedPosts";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useRouter } from "next/navigation";
import { PATHNAME } from "@/constants/routes/pathnameRoutes";
import { getThumbnailByGroup } from "@/utils/getThumnailByGroup";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEditStore } from "@/store/edit";
import { useMutation } from "@tanstack/react-query";
import { deletePost } from "@/services/api/blog/edit";
import { incrementPostView } from "@/services/api/blog/[id]";
import { formatViewCount } from "@/utils/formatViewCount";
import {
  AudienceMarkerSpec,
  formatAudienceLabel,
} from "@/components/editor/blockAudience/audienceMarkerLayer";
import { useTranslations } from "next-intl";
import { useHeaderStore } from "@/store/header";
import { parseBlockNoteContent } from "@/utils/contentFormat";
import useModalStore from "@/store/modal";
import CommonModal from "@/components/modal/type/common";

// useCreateBlockNote가 SSR 중 window를 참조해 페이지가 500을 반환하므로
// BlockNote 본문은 클라이언트 전용(ssr:false)으로만 로드한다.
const ArticleBody = dynamic(() => import("./articleBody"), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full rounded-2xl" />,
});

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
          <FillButton onClick={() => router.push(PATHNAME.LOGIN)}>
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
  const tBlog = useTranslations("blog");

  // 헤더 상태 초기화
  const setDefaultSetting = useHeaderStore((state) => state.setDefaultSetting);
  useEffect(() => {
    setDefaultSetting();
    // eslint-disable-next-line
  }, []);

  // 조회수 표시값. 실제 증가는 아래(인증 확정 후, 본인 글 제외)에서 처리.
  const [viewCount, setViewCount] = useState<number>(post.views ?? 0);

  /**
   * EDITOR_LOGIC
   */
  const { user } = useAuth();

  // 조회수 증가: 세션당 1회(sessionStorage). 본인 글은 세지 않는다.
  // (로그인 여부는 서버가 확정해 내려주므로 첫 렌더에서 바로 판정할 수 있다.)
  useEffect(() => {
    if (user && post.authorNickname === user.nickname) return; // 본인 글은 조회수 제외
    const key = `viewed:${post.id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const increment = async () => {
      try {
        const res = await incrementPostView(post.id);
        setViewCount(res.view);
      } catch {
        /* 조회수 증가 실패는 UX에 영향 없으므로 조용히 무시 */
      }
    };
    increment();
    // eslint-disable-next-line
  }, []);

  const setAllEditState = useEditStore((state) => state.setAllEditState);
  const router = useRouter();
  const params = useParams();
  const queryId = typeof params.id === "string" ? params.id : params.id[0];

  // Parse BlockNote content
  const blockNoteContent = useMemo(() => {
    return parseBlockNoteContent(post.content);
  }, [post.content]);

  // 마스킹 블러/툴팁 처리는 ArticleBody(클라이언트 전용)에서 수행한다.
  const isAnon = !user;

  // 백엔드가 viewer마다 미리 풀어준 그룹명을 그대로 마커로.
  // - owner: 전체 audience-set 블록의 라벨이 옴
  // - 비-owner: 본인이 마스킹당한(블러된) 블록의 라벨만 옴 → 블러 옆에 "🔒 친구" 노출
  const audienceMarkers = useMemo<AudienceMarkerSpec[]>(() => {
    const labels = post.blockAudienceLabels;
    if (!labels) return [];
    const out: AudienceMarkerSpec[] = [];
    for (const [blockId, names] of Object.entries(labels)) {
      if (!names || names.length === 0) continue;
      out.push({ blockId, label: formatAudienceLabel(names) });
    }
    return out;
  }, [post.blockAudienceLabels]);

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
        blockAudienceMap: post.blockAudienceMap ?? {},
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

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(queryId),
    onSuccess: () => {
      router.back();
    },
  });

  return (
    <>
      {/* 본문 ARTICLE */}
      <div className="col-span-full mb-10 flex h-fit flex-col justify-center gap-x-[1.5vw] lg:col-start-3 lg:col-end-9 xl:col-start-3 xl:col-end-9">
        <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-2xl">
          <Image
            alt="Thumnail"
            src={
              post?.thumbnailUrl ||
              getThumbnailByGroup(post.group.label, "postBanner")
            }
            className="bg-secondary object-cover object-top"
            priority
            fill
            sizes="100vw"
          />
        </div>

        <TagWrapper as="collapsible" align="center" className="mb-4">
          {post?.tags.length ? (
            post.tags.map((tag) => (
              <Tag type="button" id={tag.id} title={tag.label} key={tag.id} />
            ))
          ) : (
            <Tag id={0} title={t("noTag")} className="pointer-events-none" />
          )}
        </TagWrapper>

        <div
          className="mb-4 text-center text-2xl font-semibold md:text-5xl"
          style={{ lineHeight: 1.4 }}
        >
          {post.title}
        </div>

        {/* INFORMATIONS */}
        <div className="mb-12 flex flex-wrap items-center justify-center">
          <div className="group flex cursor-pointer items-center justify-center gap-2 text-sm text-gray-300 transition-all hover:scale-105">
            <FolderIcon size={18} className="group-hover:text-gray-600" />
            {post.group.label && (
              <Link
                href={PATHNAME.BLOG + `?groupId=${post.group.id}`}
                className="group-hover:text-gray-600"
              >
                {post.group.label}
              </Link>
            )}
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

          <span className="mx-2 text-gray-200">•</span>

          {/* VIEWS */}
          <div className="pointer-events-none flex items-center justify-center gap-2 text-sm text-gray-300">
            <Eye size={18} />
            <span>{formatViewCount(viewCount, tBlog("viewsUnderTen"))}</span>
          </div>

          {/* LOGGINED */}
          {(post.authorNickname === user?.nickname ||
            user?.role === "member") && (
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

        {/* BlockNote 본문 — useCreateBlockNote가 서버에서 window를 건드려
            500을 유발하므로 ssr:false 클라이언트 전용으로 로드한다.
            (.lg:-mx-[46px] 보정은 ArticleBody 내부에서 적용) */}
        <ArticleBody
          blockNoteContent={blockNoteContent}
          maskedBlockIds={post.maskedBlockIds ?? []}
          isAnon={isAnon}
          audienceMarkers={audienceMarkers}
          // blockAudienceMap은 서버가 owner(마스킹 우회)에게만 내려줌 → 인라인 하이라이트 판정.
          isOwner={post.blockAudienceMap !== undefined}
        />
      </div>

      {/* 목차 */}
      <div className="relative col-start-9 col-end-12">
        <BlogIndex />
      </div>

      {/* 댓글 */}
      <BlogComment />

      <RelatedAndAdjacentPost id={post.id} />
    </>
  );
}
