"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PartialBlock,
  BlockNoteSchema,
  createCodeBlockSpec,
} from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { codeBlockOptions } from "@blocknote/code-block";
import { useTheme } from "next-themes";

import { Divider } from "@/components/common";
import { BlogEditorToolBar } from "@/components/pages";
import { EditorErrorBoundary } from "@/components/error/EditorErrorBoundary";
import { postCreatePreSignedUrl, postUploadS3 } from "@/services/api/blog/edit";
import { BlogEditorProvider } from "@/contexts/BlogEditorContext";

import { CategoryType, GroupType, TagType } from "@/types";
import { cn } from "@/utils/cn";

import { LAYOUT_PADDING_ALONGSIDE } from "@/constants/layouts/layout";
import { sortStringOrder } from "@/utils/sortTagOrder";
import { useEditStore } from "@/store/edit";
import useModalStore from "@/store/modal";
import CommonModal from "@/components/modal/type/common";
import { useLocale, useTranslations } from "next-intl";
import { usePageLeavePrevent } from "@/hooks/usePageLeavePrevent";
import { useAutoSave } from "@/hooks/useAutoSave";
import { DraftData } from "@/lib/indexedDB";

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

  // Theme
  const { resolvedTheme } = useTheme();

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

  const handleChangeTitle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    const target = e.target as HTMLTextAreaElement;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  };

  // BlockNote 에디터 초기화
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
    uploadFile: async (file: File) => {
      try {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error("파일 크기는 10MB 이하여야 합니다.");
        }

        const preSignedUrl = await postCreatePreSignedUrl(file.name, file.type);
        const { url, publicUrl } = preSignedUrl;

        await postUploadS3(url, file);

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
    };
  }, [draftId, title, selectedGroup, selectedCategory, selectedTags, editor]);

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
      content: PartialBlock[] | undefined,
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
    // BlockNote document를 그대로 반환
    return editor.document;
  }, [editor]);

  const getDeserializeContent = useCallback(
    (content: PartialBlock[]) => {
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
    ],
  );

  return (
    <EditorErrorBoundary emergencySave={emergencySave}>
      <BlogEditorProvider state={stateValue} actions={actionsValue}>
        <main className="flex min-h-screen w-full flex-col">
          {/* 상단 헤더 (ToolBar) */}
          <BlogEditorToolBar />

          {/* 본문 영역 */}
          <div
            className={cn(
              "flex w-full flex-1 justify-center pt-24",
              LAYOUT_PADDING_ALONGSIDE,
            )}
          >
            <div className="flex w-[760px] flex-col">
              {/* INPUT */}
              <textarea
                className="flex h-auto min-h-20 w-full resize-none flex-wrap overflow-hidden rounded-md border-none bg-transparent px-14 px-2 py-4 text-5xl font-semibold leading-normal outline-none transition-colors placeholder:text-gray-100 hover:bg-gray-1 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800"
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
              <BlockNoteView
                editor={editor}
                theme={resolvedTheme === "dark" ? "dark" : "light"}
                editable={true}
              />
            </div>
          </div>
        </main>
      </BlogEditorProvider>
    </EditorErrorBoundary>
  );
}
