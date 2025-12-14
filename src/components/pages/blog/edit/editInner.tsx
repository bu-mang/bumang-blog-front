"use client";

import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

import { Divider } from "@/components/common";
import { BlogEditorToolBar } from "@/components/pages";
import { EditorErrorBoundary } from "@/components/error/EditorErrorBoundary";
import { postCreatePreSignedUrl, postUploadS3 } from "@/services/api/blog/edit";

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

  // ------------- 중앙부 그룹/카테고리/태그 로직 -------------

  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null,
  );
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [unselectedTags, setUnselectedTags] = useState<TagType[]>(tagLists);

  const handleChangeSelectedGroup = (v: GroupType) => {
    setSelectedGroup(v);
  };

  const handleChangeSelectedCategory = (v: CategoryType) => {
    setSelectedCategory(v);
  };

  const handleSwitchTags = ({
    targetId,
    from,
  }: {
    targetId: number;
    from: "selectedTags" | "unselectedTags";
  }) => {
    if (from === "selectedTags") {
      const foundIndex = selectedTags.findIndex((item) => item.id === targetId);
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
  };

  // ------------- 본문 로직 -------------

  const [title, setTitle] = useState("");
  const [draftId] = useState(() => Date.now());

  const handleChangeTitle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    const target = e.target as HTMLTextAreaElement;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  };

  // BlockNote 에디터 초기화
  const editor = useCreateBlockNote({
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
  }, [draftId, title, selectedGroup, selectedCategory, selectedTags]);

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
  const handleDraftOpen = () => setIsDraftOpen((prev) => !prev);

  const handleEditValues = (
    title: string,
    value: PartialBlock[] | undefined,
    group: GroupType | null,
    category: CategoryType | null,
    tags: TagType[],
  ) => {
    setTitle(title);

    // BlockNote content 복원
    if (value && editor) {
      editor.replaceBlocks(
        editor.document,
        value,
      );
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
  };

  // ------------- 수정 페이지 Draft 로드 -------------

  const openModal = useModalStore((state) => state.openModal);
  const editId = useEditStore((state) => state.id);
  const editDraft = useEditStore((state) => state.editDraft);
  const entryPoint = useEditStore((state) => state.entryPoint);
  const setAllEditState = useEditStore((state) => state.setAllEditState);

  useLayoutEffect(() => {
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

      if (editDraft.title) {
        setTitle(editDraft.title);
      }

      if (editDraft.content && editor && Array.isArray(editDraft.content)) {
        // BlockNote content 복원
        editor.replaceBlocks(
          editor.document,
          editDraft.content,
        );
      }

      if (editDraft.selectedGroup) {
        const editGroup = groupLists.find(
          (group) => group.id === editDraft.selectedGroup?.id,
        );

        let editCategory: CategoryType | null = null;

        if (editDraft.selectedCategory && editGroup) {
          const foundCategory = editGroup.categories.find(
            (category) => category.id === editDraft.selectedCategory?.id,
          );
          editCategory = foundCategory ?? null;
        }

        setSelectedCategory(editCategory);
        setSelectedGroup(editGroup ?? null);
      }

      const selected: TagType[] = [];
      const unselected: TagType[] = [];
      if (editDraft.selectedTags) {
        const selectedTagIds = editDraft.selectedTags.map((item) => item.id);
        tagLists.forEach((tag) => {
          if (selectedTagIds.includes(tag.id)) {
            selected.push(tag);
          } else {
            unselected.push(tag);
          }
        });
      }

      setSelectedTags(selected);
      setUnselectedTags(unselected);
    };

    handleLoadDraft();
    // eslint-disable-next-line
  }, [editId, editDraft, groupLists, tagLists]);

  // ------------- 페이지 이탈 방지 -------------

  const hasContent = useMemo(() => !!title || !!editor?.document, [
    title,
    editor,
  ]);

  const { disablePrevent } = usePageLeavePrevent({
    enabled: hasContent,
  });

  // ------------- 직렬화/역직렬화 (BlockNote용) -------------

  const getSerializeContent = useCallback(() => {
    if (!editor) return undefined;
    // BlockNote document를 그대로 반환
    return editor.document;
  }, [editor]);

  const getDeserializeContent = useCallback((content: PartialBlock[]) => {
    if (!editor) return;
    editor.replaceBlocks(editor.document, content);
  }, [editor]);

  return (
    <EditorErrorBoundary emergencySave={emergencySave}>
      <main className="flex min-h-screen w-full flex-col">
        {/* 상단 헤더 (ToolBar) */}
        <BlogEditorToolBar
          // Content
          onSerialize={getSerializeContent}
          onDeserialize={getDeserializeContent}
          // Group
          selectedGroup={selectedGroup}
          onChangeSelectedGroup={handleChangeSelectedGroup}
          groupLists={groupLists}
          // Category
          selectedCategory={selectedCategory}
          onChangeSelectedCategory={handleChangeSelectedCategory}
          // Tags
          selectedTags={selectedTags}
          unselectedTags={unselectedTags}
          handleSwitchTags={handleSwitchTags}
          // Draft
          isDraftOpen={isDraftOpen}
          handleDraftOpen={handleDraftOpen}
          handleEditValues={handleEditValues}
          // PUBLISH!
          title={title}
          editor={editor}
          onDisablePrevent={disablePrevent}
          // Auto-save status (새로 추가)
          saveStatus={saveStatus}
          lastSavedAt={lastSavedAt}
        />

        {/* 본문 영역 */}
        <div
          className={cn(
            "flex w-full flex-1 justify-center pt-24",
            LAYOUT_PADDING_ALONGSIDE,
          )}
        >
          <div className="flex w-[720px] flex-col">
            {/* INPUT */}
            <textarea
              className="flex h-auto min-h-20 w-full resize-none flex-wrap overflow-hidden rounded-md border-none bg-transparent px-2 py-4 text-5xl font-semibold leading-normal outline-none transition-colors placeholder:text-gray-100 hover:bg-gray-1 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800"
              placeholder={t("titlePlaceHolder")}
              tabIndex={1}
              value={title}
              maxLength={48}
              onChange={handleChangeTitle}
            />

            {/* DIVIDER */}
            <Divider direction="horizontal" className={"w-full bg-gray-5"} />

            {/* BLOCKNOTE EDITOR */}
            <BlockNoteView
              editor={editor}
              theme="light"
              editable={true}
            />
          </div>
        </div>
      </main>
    </EditorErrorBoundary>
  );
}
