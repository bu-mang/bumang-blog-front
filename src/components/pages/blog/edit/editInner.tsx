"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useTheme } from "next-themes";
import {
  blogBlockNoteSchema,
  BlogPartialBlock,
} from "@/components/editor/blogBlockNoteSchema";
import BlockAudienceDialog from "@/components/editor/blockAudience/blockAudienceDialog";
import BlockAudienceSideMenu from "@/components/editor/blockAudience/blockAudienceSideMenu";
import BlockAudienceSlashMenu from "@/components/editor/blockAudience/blockAudienceSlashMenu";
import { MaskFormattingToolbar } from "@/components/editor/maskFormattingToolbar";

import { Divider } from "@/components/common";
import { BlogEditorToolBar } from "@/components/pages";
import { EditorErrorBoundary } from "@/components/error/EditorErrorBoundary";
import {
  postCreatePreSignedUrl,
  postUploadS3,
  postUploadExternalImage,
} from "@/services/api/blog/edit";
import { BlogEditorProvider } from "@/contexts/BlogEditorContext";
import AudienceMarkerLayer, {
  AudienceMarkerSpec,
  formatAudienceLabel,
} from "@/components/editor/blockAudience/audienceMarkerLayer";
import { useQuery } from "@tanstack/react-query";
import { getUserGroups } from "@/services/api/userGroups";

import { CategoryType, GroupType, TagType } from "@/types";

import { sortStringOrder } from "@/utils/sortTagOrder";
import { compressImageFile } from "@/utils/compressImage/client";
import { useEditStore } from "@/store/edit";
import useModalStore from "@/store/modal";
import CommonModal from "@/components/modal/type/common";
import { useLocale, useTranslations } from "next-intl";
import { usePageLeavePrevent } from "@/hooks/usePageLeavePrevent";
import { useAutoSave } from "@/hooks/useAutoSave";
import { DraftData } from "@/lib/indexedDB";

/**
 * 붙여넣은 plain text가 마크다운 문법을 포함하는지 판별하는 휴리스틱.
 * BlockNote 기본 휴리스틱(헤딩 뒤 빈 줄 요구 등)이 너무 엄격해
 * `# 제목`이 그대로 텍스트로 들어가는 문제를 보완하기 위해 더 느슨하게 검사한다.
 */
const looksLikeMarkdown = (text: string) =>
  /(^|\n)\s{0,3}#{1,6}\s/.test(text) || // 헤딩
  /(^|\n)\s{0,3}[-*+]\s/.test(text) || // 순서 없는 리스트
  /(^|\n)\s{0,3}\d+\.\s/.test(text) || // 순서 있는 리스트
  /(^|\n)\s{0,3}>\s/.test(text) || // 인용
  /```|~~~/.test(text) || // 코드 블록
  /(\*\*|__)[^\s].*?[^\s](\*\*|__)/.test(text) || // 볼드
  /\[[^\]]+\]\([^)]+\)/.test(text) || // 링크
  /(^|\n)\s{0,3}(-{3,}|\*{3,}|_{3,})\s*$/.test(text) || // 구분선
  /(^|\n)\s*\|.+\|/.test(text); // 테이블

interface BlogEditInnerProps {
  tagLists: TagType[];
  groupLists: GroupType[];
}

export default function BlogEditInner({
  tagLists,
  groupLists,
}: BlogEditInnerProps) {
  // i18n
  const t = useTranslations("blogEdit");
  const locale = useLocale();

  // ------------- 중앙부 그룹/카테고리/태그 로직 -------------

  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null,
  );
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [unselectedTags, setUnselectedTags] = useState<TagType[]>(tagLists);

  const handleChangeSelectedGroup = useCallback((v: GroupType) => {
    setSelectedGroup(v);
  }, []);

  const handleChangeSelectedCategory = useCallback((v: CategoryType) => {
    setSelectedCategory(v);
  }, []);

  const handleSwitchTags = useCallback(
    ({
      targetId,
      from,
    }: {
      targetId: number;
      from: "selectedTags" | "unselectedTags";
    }) => {
      if (from === "selectedTags") {
        const foundIndex = selectedTags.findIndex(
          (item) => item.id === targetId,
        );
        if (foundIndex === -1) return;

        const newUnselectedTags = sortStringOrder([
          selectedTags[foundIndex],
          ...unselectedTags,
        ]);
        const newSelectedTags = [...selectedTags].filter(
          (item) => item.id !== selectedTags[foundIndex].id,
        );

        setSelectedTags(newSelectedTags);
        setUnselectedTags(newUnselectedTags);
      } else if (from === "unselectedTags") {
        const foundIndex = unselectedTags.findIndex(
          (item) => item.id === targetId,
        );
        if (foundIndex === -1) return;

        const newSelectedTags = [unselectedTags[foundIndex], ...selectedTags];
        const newUnselectedTags = [...unselectedTags].filter(
          (item) => item.id !== unselectedTags[foundIndex].id,
        );

        setSelectedTags(newSelectedTags);
        setUnselectedTags(sortStringOrder(newUnselectedTags));
      }
    },
    [selectedTags, unselectedTags],
  );

  // ------------- 본문 로직 -------------

  const [title, setTitle] = useState("");
  const [draftId, setDraftId] = useState(() => Date.now());

  // ------------- AUDIENCE 상태 -------------
  // 블록별 audience (block.id → groupId[]). 키 없거나 빈 배열은 공개.
  const [blockAudienceMap, setBlockAudienceMap] = useState<
    Record<string, number[]>
  >({});
  const setBlockAudience = useCallback(
    (blockId: string, groupIds: number[] | undefined) => {
      setBlockAudienceMap((prev) => {
        const next = { ...prev };
        if (groupIds === undefined || (groupIds && groupIds.length === 0)) {
          delete next[blockId];
        } else {
          next[blockId] = groupIds;
        }
        return next;
      });
    },
    [],
  );

  // 공개대상 설정 다이얼로그가 어느 블록을 대상으로 하는지
  const [audienceTargetBlockId, setAudienceTargetBlockId] = useState<
    string | null
  >(null);
  const openBlockAudience = useCallback(
    (blockId: string) => setAudienceTargetBlockId(blockId),
    [],
  );
  const closeBlockAudience = useCallback(
    () => setAudienceTargetBlockId(null),
    [],
  );

  // 마커 라벨용. 다이얼로그가 fetch한 캐시만 구독(enabled:false). 캐시 없으면 "N개 그룹" 폴백.
  const { data: groups = [] } = useQuery({
    queryKey: ["user-groups"],
    queryFn: getUserGroups,
    enabled: false,
  });
  const audienceMarkers = useMemo<AudienceMarkerSpec[]>(() => {
    const groupNameById = new Map<number, string>();
    groups.forEach((g) => groupNameById.set(g.id, g.name));
    const out: AudienceMarkerSpec[] = [];
    for (const [blockId, ids] of Object.entries(blockAudienceMap)) {
      if (!ids || ids.length === 0) continue;
      const names = ids
        .map((id) => groupNameById.get(id))
        .filter((n): n is string => !!n);
      const label =
        names.length > 0 ? formatAudienceLabel(names) : `${ids.length}개 그룹`;
      out.push({ blockId, label });
    }
    return out;
  }, [blockAudienceMap, groups]);

  const titleRef = useRef<HTMLTextAreaElement>(null);

  const resizeTitle = useCallback(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  const handleChangeTitle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
  };

  // title이 바뀌면(직접 입력/수정 페이지 backfill 모두) textarea 높이 재계산.
  // useLayoutEffect: paint 전에 동기적으로 실행되어 깜빡임 방지.
  useLayoutEffect(() => {
    resizeTitle();
  }, [title, resizeTitle]);

  // BlockNote가 시스템 OS 색상이 아닌 앱 테마(next-themes)를 따르게 함.
  const { resolvedTheme } = useTheme();

  // BlockNote 에디터 초기화 (detail 페이지와 공유하는 스키마)
  const editor = useCreateBlockNote({
    schema: blogBlockNoteSchema,
    // 마크다운 텍스트를 붙여넣으면 자동으로 블록으로 변환한다.
    // 코드 블록 안 / 파일 붙여넣기는 BlockNote 기본 동작을 유지한다.
    pasteHandler: ({ event, editor, defaultPasteHandler }) => {
      const plain = event.clipboardData?.getData("text/plain");
      const hasFiles = event.clipboardData?.types.includes("Files");
      const inCodeBlock =
        editor.getTextCursorPosition().block.type === "codeBlock";

      if (plain && !hasFiles && !inCodeBlock && looksLikeMarkdown(plain)) {
        editor.pasteMarkdown(plain);
        return true;
      }

      return defaultPasteHandler();
    },
    uploadFile: async (file: File) => {
      try {
        // 외부 URL 이미지인 경우 (클립보드로 붙여넣은 경우)
        const isExternalUrl =
          file.name.startsWith("http://") || file.name.startsWith("https://");

        if (isExternalUrl) {
          console.log("🔗 External URL detected, using proxy:", file.name);
          const response = await postUploadExternalImage(file.name);
          return response.publicUrl;
        }

        // 로컬 파일인 경우 (기존 로직)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error("파일 크기는 10MB 이하여야 합니다.");
        }

        // S3는 올린 그대로 저장하고 본문은 그 원본을 직접 불러오므로 올리기 전에 줄인다.
        const uploadTarget = await compressImageFile(file);

        const preSignedUrl = await postCreatePreSignedUrl(
          uploadTarget.name,
          uploadTarget.type,
        );
        const { url, publicUrl } = preSignedUrl;

        await postUploadS3(url, uploadTarget);

        return publicUrl;
      } catch (error) {
        console.error("File upload failed:", error);
        throw error;
      }
    },
  });

  // ------------- 자동저장 로직 (새로 추가) -------------

  const getDraftData = useCallback((): DraftData => {
    const content = editor?.document || [];

    return {
      id: draftId,
      title,
      content,
      selectedGroup,
      selectedCategory,
      selectedTags,
      lastUpdatedAt: new Date().toISOString(),
      blockAudienceMap,
    };
  }, [
    draftId,
    title,
    selectedGroup,
    selectedCategory,
    selectedTags,
    editor,
    blockAudienceMap,
  ]);

  const { saveStatus, lastSavedAt, emergencySave } = useAutoSave({
    enabled: true,
    getData: getDraftData,
    debounceMs: 2000,
    maxWaitMs: 30000,
    onSaveSuccess: () => {
      console.log("Auto-save successful");
    },
    onSaveError: (error) => {
      console.error("Auto-save failed:", error);
    },
  });

  // ------------- 임시저장 DRAFT 로직 -------------

  const [isDraftOpen, setIsDraftOpen] = useState(false);
  const handleDraftOpen = useCallback(
    () => setIsDraftOpen((prev) => !prev),
    [],
  );

  const loadDraftToEditor = useCallback(
    (
      title: string,
      content: BlogPartialBlock[] | undefined,
      group: GroupType | null,
      category: CategoryType | null,
      tags: TagType[],
      nextDraftId?: number,
    ) => {
      setTitle(title);
      if (nextDraftId) {
        setDraftId(nextDraftId);
      }

      // BlockNote content 복원
      if (content && editor) {
        editor.replaceBlocks(editor.document, content);
      }

      setSelectedGroup(group);
      setSelectedCategory(category);

      const selected: TagType[] = [];
      const unselected: TagType[] = [];
      tagLists.forEach((item) => {
        const titles = tags.map((item) => item.title);
        if (titles.includes(item.title)) {
          selected.push(item);
        } else {
          unselected.push(item);
        }
      });

      setSelectedTags(selected);
      setUnselectedTags(unselected);
    },
    [editor, tagLists],
  );

  // ------------- 수정 페이지 Draft 로드 -------------

  const openModal = useModalStore((state) => state.openModal);
  const editId = useEditStore((state) => state.id);
  const editDraft = useEditStore((state) => state.editDraft);
  const entryPoint = useEditStore((state) => state.entryPoint);
  const setAllEditState = useEditStore((state) => state.setAllEditState);

  useEffect(() => {
    if (!editDraft) return;

    const title =
      locale === "ko" ? "작성하던 글이 존재해요." : "A Draft Exists";
    const desc =
      locale === "ko" ? "불러오시겠어요?" : "Would you like to load it?";

    const handleLoadDraft = async () => {
      if (entryPoint === "new") {
        const res = await openModal(CommonModal, {
          title,
          desc,
          proceedFn: () => true,
        });

        if (!res) {
          setAllEditState(editId, null, "new");
          return;
        }
      }

      // Group과 Category 찾기
      let editGroup: GroupType | null = null;
      let editCategory: CategoryType | null = null;

      if (editDraft.selectedGroup) {
        editGroup =
          groupLists.find(
            (group) => group.id === editDraft.selectedGroup?.id,
          ) ?? null;

        if (editDraft.selectedCategory && editGroup) {
          const foundCategory = editGroup.categories.find(
            (category) => category.id === editDraft.selectedCategory?.id,
          );
          editCategory = foundCategory ?? null;
        }
      }

      // Tags 찾기
      const selectedTags: TagType[] = [];
      if (editDraft.selectedTags) {
        const selectedTagIds = editDraft.selectedTags.map((item) => item.id);
        tagLists.forEach((tag) => {
          if (selectedTagIds.includes(tag.id)) {
            selectedTags.push(tag);
          }
        });
      }

      // loadDraftToEditor로 통일
      loadDraftToEditor(
        editDraft.title ?? "",
        Array.isArray(editDraft.content) ? editDraft.content : undefined,
        editGroup,
        editCategory,
        selectedTags,
      );

      // audience 상태 복원
      if (editDraft.blockAudienceMap) {
        setBlockAudienceMap(editDraft.blockAudienceMap);
      }
    };

    handleLoadDraft();
    // eslint-disable-next-line
  }, [editId, editDraft, groupLists, tagLists]);

  // ------------- 페이지 이탈 방지 -------------

  const hasContent = useMemo(
    () => !!title || !!editor?.document,
    [title, editor],
  );

  const { disablePrevent } = usePageLeavePrevent({
    enabled: hasContent,
  });

  // ------------- 직렬화/역직렬화 (BlockNote용) -------------

  const getSerializeContent = useCallback(() => {
    if (!editor) return undefined;
    return editor.document;
  }, [editor]);

  const getDeserializeContent = useCallback(
    (content: BlogPartialBlock[]) => {
      if (!editor) return;
      editor.replaceBlocks(editor.document, content);
    },
    [editor],
  );

  const stateValue = useMemo(
    () => ({
      editor,
      title,
      draftId,
      selectedGroup,
      selectedCategory,
      selectedTags,
      unselectedTags,
      isDraftOpen,
      saveStatus,
      lastSavedAt,
      blockAudienceMap,
      audienceTargetBlockId,
    }),
    [
      editor,
      title,
      draftId,
      selectedGroup,
      selectedCategory,
      selectedTags,
      unselectedTags,
      isDraftOpen,
      saveStatus,
      lastSavedAt,
      blockAudienceMap,
      audienceTargetBlockId,
    ],
  );

  const actionsValue = useMemo(
    () => ({
      onChangeSelectedGroup: handleChangeSelectedGroup,
      onChangeSelectedCategory: handleChangeSelectedCategory,
      handleSwitchTags,
      handleDraftOpen,
      setDraftId,
      loadDraftToEditor,
      onSerialize: getSerializeContent,
      onDeserialize: getDeserializeContent,
      onDisablePrevent: disablePrevent,
      groupLists,
      setBlockAudience,
      setBlockAudienceMap,
      openBlockAudience,
      closeBlockAudience,
    }),
    [
      handleChangeSelectedGroup,
      handleChangeSelectedCategory,
      handleSwitchTags,
      handleDraftOpen,
      setDraftId,
      loadDraftToEditor,
      getSerializeContent,
      getDeserializeContent,
      disablePrevent,
      groupLists,
      setBlockAudience,
      openBlockAudience,
      closeBlockAudience,
    ],
  );

  return (
    <EditorErrorBoundary emergencySave={emergencySave}>
      <BlogEditorProvider state={stateValue} actions={actionsValue}>
        <main className="flex min-h-screen w-full flex-col">
          {/* 상단 헤더 (ToolBar) */}
          <BlogEditorToolBar />

          {/* 본문 영역 — 상세 페이지와 동일한 grid 레이아웃 */}
          <div className="grid h-fit flex-1 grid-cols-10 gap-x-[1.5vw] px-[2vw] pt-24 md:px-[6vw]">
            <div className="col-span-full flex flex-col lg:col-start-3 lg:col-end-9">
              {/* INPUT */}
              <textarea
                ref={titleRef}
                className="flex h-auto min-h-20 w-full resize-none flex-wrap overflow-hidden rounded-md border-none bg-transparent px-2 py-4 text-5xl font-semibold leading-normal outline-none transition-colors placeholder:text-gray-100 hover:bg-gray-1 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800"
                placeholder={t("titlePlaceHolder")}
                tabIndex={1}
                value={title}
                maxLength={48}
                onChange={handleChangeTitle}
              />

              {/* DIVIDER */}
              <Divider
                direction="horizontal"
                className={"w-full bg-gray-5 px-14"}
              />

              {/* BLOCKNOTE EDITOR */}
              {/* BlockNote 내부 .bn-editor의 padding-inline:54px를 보정해
                  데스크탑(lg↑)에서 본문 가시 폭을 제목/컨테이너에 맞춤.
                  모바일에선 col-span-full이라 여백이 부족하므로 lg부터만 적용. */}
              <div className="lg:-mx-[46px]">
                <BlockNoteView
                  editor={editor}
                  theme={resolvedTheme === "dark" ? "dark" : "light"}
                  editable={true}
                  sideMenu={false}
                  slashMenu={false}
                  // 커스텀 컴포넌트를 자식으로 넣을 땐 같은 이름의 기본 메뉴를 반드시 끈다.
                  // 안 끄면 기본 툴바와 MaskFormattingToolbar가 둘 다 마운트돼 겹치고,
                  // 그 상태에선 "가리기" 드롭다운이 렌더되지 않는다.
                  formattingToolbar={false}
                >
                  <BlockAudienceSideMenu
                    onSetAudience={openBlockAudience}
                    blockAudienceMap={blockAudienceMap}
                  />
                  <BlockAudienceSlashMenu
                    editor={editor}
                    onSetAudience={openBlockAudience}
                  />
                  <AudienceMarkerLayer
                    markers={audienceMarkers}
                    onClick={openBlockAudience}
                  />
                  <MaskFormattingToolbar />
                </BlockNoteView>
              </div>
            </div>
          </div>
        </main>
        <BlockAudienceDialog />
      </BlogEditorProvider>
    </EditorErrorBoundary>
  );
}
