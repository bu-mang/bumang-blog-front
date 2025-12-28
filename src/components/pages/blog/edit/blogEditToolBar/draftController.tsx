"use client";

import { ButtonBase } from "@/components/common";
import CommonModal from "@/components/modal/type/common";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useModalStore from "@/store/modal";
import { cn } from "@/utils/cn";
import { format } from "date-fns";
import { Plus, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useBlogEditorContext } from "@/contexts/BlogEditorContext";
import {
  getAllDrafts,
  saveDraft as saveIndexedDBDraft,
  deleteDraft as deleteIndexedDBDraft,
  DraftData,
} from "@/lib/indexedDB";

interface DraftControllerProps {
  className?: string;
}

const DraftController = ({ className }: DraftControllerProps) => {
  // Context에서 모든 값 가져오기
  const {
    isDraftOpen,
    handleDraftOpen,
    loadDraftToEditor,
    title,
    editor,
    draftId,
    setDraftId,
    selectedGroup,
    selectedCategory,
    selectedTags,
    onSerialize,
  } = useBlogEditorContext();

  const content = onSerialize() || [];
  const t = useTranslations("blogEdit.draft");
  const triggerClass = cn(
    "group flex h-10 min-w-24 cursor-pointer items-center justify-center gap-2 rounded-md px-4 transition-all hover:bg-gray-5 dark:hover:bg-gray-800",
    className,
  );

  const [status, setStatus] = useState<string>(t("status.none"));
  const [drafts, setDrafts] = useState<DraftData[]>([]);

  // 현재 draft 상태 (props에서 가져온 값들)
  const currentDraft = useMemo(
    () => ({
      id: draftId,
      title,
      content,
      selectedGroup,
      selectedCategory,
      selectedTags,
      lastUpdatedAt: new Date().toISOString(),
    }),
    [draftId, title, content, selectedGroup, selectedCategory, selectedTags],
  );

  const openModal = useModalStore((state) => state.openModal);
  const handleOpenProcessPopup = async (
    title?: string,
    desc?: string,
    proceedLabel?: string,
  ) => {
    const res = await openModal(CommonModal, {
      title,
      desc,
      proceedLabel,
    });

    return res;
  };

  // IndexedDB에서 모든 draft 목록 불러오기
  const loadDraftsFromDB = useCallback(async () => {
    try {
      const allDrafts = await getAllDrafts();
      setDrafts(allDrafts);
    } catch (error) {
      console.error("Draft 불러오기 실패:", error);
    }
  }, []);

  // 임시저장 추가/업데이트 (IndexedDB)
  const saveDraft = useCallback(
    async (draftToSave: DraftData) => {
      setStatus(t("status.saving"));
      draftToSave.content = onSerialize() || [];

      try {
        await saveIndexedDBDraft(draftToSave);
        await loadDraftsFromDB();
        setTimeout(() => setStatus(t("status.none")), 1000);
      } catch (error) {
        console.error("Draft 저장 실패:", error);
        setStatus(t("status.none"));
      }
    },
    // eslint-disable-next-line
    [onSerialize, loadDraftsFromDB],
  );

  // 임시저장 삭제
  const deleteDraft = async (targetDraftId: number) => {
    try {
      await deleteIndexedDBDraft(targetDraftId);
      await loadDraftsFromDB();

      // 현재 선택된 draft가 삭제된 경우 새 ID 생성
      if (draftId === targetDraftId) {
        setDraftId(Date.now());
      }
    } catch (error) {
      console.error("Draft 삭제 실패:", error);
    }
  };

  // 임시저장 불러오기
  const loadDraft = async (targetDraftId: number) => {
    const draft = drafts.find((d) => d.id === targetDraftId);
    if (!draft) return;

    let res: boolean | undefined = false;

    if (title || content) {
      res = await handleOpenProcessPopup(
        t("modals.load.title"),
        t("modals.load.desc"),
      );

      if (!res) return;
    }

    setDraftId(targetDraftId);

    let draftContent = undefined;
    if (Array.isArray(draft.content)) {
      draftContent = draft.content;
    }

    // 에디터에 값 설정
    loadDraftToEditor(
      draft.title,
      draftContent,
      draft.selectedGroup,
      draft.selectedCategory,
      draft.selectedTags,
      targetDraftId,
    );
  };

  // 현재 내용으로 덮어쓰기
  const overwriteDraft = async (targetDraftId: number) => {
    let res: boolean | undefined = false;

    if (draftId !== targetDraftId && (title || content)) {
      res = await handleOpenProcessPopup(
        t("modals.overWrite.title"),
        t("modals.overWrite.desc"),
      );

      if (!res) return;
    }

    const updatedDraft = {
      ...currentDraft,
      id: targetDraftId,
    };

    setDraftId(targetDraftId);
    await saveDraft(updatedDraft);
  };

  // 새 draft 시작
  const startNewDraft = async () => {
    // 기존 draft를 최신 상태로 저장
    await saveDraft(currentDraft);

    const latestContent = onSerialize() || [];
    const newId = Date.now();

    const newDraft = {
      ...currentDraft,
      content: latestContent,
      id: newId,
      lastUpdatedAt: new Date().toISOString(),
    };

    setDraftId(newId);
    await saveDraft(newDraft);
    loadDraftToEditor(
      newDraft.title || "",
      Array.isArray(newDraft.content) ? newDraft.content : undefined,
      newDraft.selectedGroup,
      newDraft.selectedCategory,
      newDraft.selectedTags,
      newId,
    );
  };

  // 초기 로딩 - IndexedDB에서 draft 목록 불러오기
  useEffect(() => {
    if (typeof window === "undefined") return;

    loadDraftsFromDB();
    // eslint-disable-next-line
  }, []);

  return (
    <Popover open={isDraftOpen} onOpenChange={handleDraftOpen}>
      {/* Status */}
      <span className="pointer-events-none text-center text-xs text-gray-300">
        {status}
      </span>
      <PopoverTrigger asChild>
        {/* Trigger */}
        <div className={triggerClass}>
          <div className="flex items-center gap-1.5 text-sm">
            <span>{t("button")}</span>
          </div>

          <div className="flex min-w-6 items-center justify-evenly gap-1 rounded-full bg-gray-5 px-2 py-0.5 shadow-sm transition-transform group-hover:bg-gray-50">
            <span className="text-xs font-semibold text-gray-700">
              {drafts.length}
            </span>
          </div>
        </div>
      </PopoverTrigger>

      {/* CONTENT */}
      <PopoverContent className="w-[320px] p-0">
        <Command>
          <CommandList>
            {/* SELECTED_LIST */}
            <div className="flex flex-col gap-1 border-b-[1px] p-2.5">
              <span className="text-xs text-gray-200">{t("innerLabel")}</span>
              <CommandEmpty>{t("noDraft")}</CommandEmpty>
              {drafts.map((draft) => (
                <CommandItem
                  className="group flex justify-between px-4 text-sm"
                  key={draft.id}
                  value={`${draft.id}`}
                  onSelect={(currentValue) => {
                    console.log(currentValue);
                    loadDraft(Number(currentValue));
                  }}
                >
                  <div className="flex flex-1 flex-col">
                    <div className="flex flex-1">
                      <h4 className="mr-3 text-[10px] text-gray-200">
                        {format(draft.lastUpdatedAt, "yyyy. MM. dd.")}
                      </h4>
                      <span className="text-[10px] text-gray-200 opacity-0 transition-all group-hover:opacity-100">
                        key: {draft.id.toString().slice(-8)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {draft.title
                          ? `${draft.title}${draft.title.length > 10 ? "..." : ""}`
                          : t("noTitle")}
                      </span>

                      {draft.id === draftId && (
                        <div
                          className={cn(
                            "flex h-4 items-center rounded-sm border border-red-200 bg-red-50 px-0.5 text-[8px] text-red-400",
                          )}
                        >
                          Current
                        </div>
                      )}
                    </div>

                    <span className="mb-1 text-xs text-gray-200">
                      {draft.selectedCategory?.label ?? t("noGroup")}•
                      {draft.selectedGroup?.label ?? t("noCategory")}
                    </span>
                  </div>

                  <div className="flex gap-1">
                    <ButtonBase
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDraft(draft.id);
                        overwriteDraft(draft.id);
                      }}
                      className="shrink-0 rounded-sm bg-gray-10 text-gray-400 active:scale-90"
                    >
                      <Save />
                    </ButtonBase>

                    <ButtonBase
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDraft(draft.id);
                      }}
                      className="shrink-0 rounded-sm bg-gray-10 text-gray-400 active:scale-90"
                    >
                      <IoClose />
                    </ButtonBase>
                  </div>
                </CommandItem>
              ))}
              <Button
                className="mt-3"
                variant="outline"
                onClick={startNewDraft}
              >
                <Plus />
                {t("addNewDraft")}
              </Button>
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default DraftController;
