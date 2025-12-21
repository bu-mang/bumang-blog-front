// lib/store/useAuthStore.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { PartialBlock } from "@blocknote/core";
import { YooptaContentValue } from "@yoopta/editor";
import { persist } from "zustand/middleware";

interface EditDraftType {
  title: string;
  content: YooptaContentValue | string | PartialBlock[] | undefined;
  selectedGroup: { id: number; label: string } | null;
  selectedCategory: { id: number; label: string } | null;
  selectedTags: { id: number; label: string }[];
}

interface EditState {
  // 쿠키에서 parsing
  id: number | null;
  editDraft: EditDraftType | null;
  entryPoint: "new" | "toUpdate";
}

interface EditAction {
  setAllEditState: (
    id: number | null,
    value: EditDraftType | null,
    entryPoint?: "new" | "toUpdate",
  ) => void;
  setEntryPoint: (entryPoint: "new" | "toUpdate") => void;
}

export const useEditStore = create<EditState & EditAction>()(
  persist(
    immer((set) => ({
      id: null,
      editDraft: null,
      entryPoint: "new",

      setAllEditState: (id, editDraft, entryPoint = "new") => {
        set((state) => {
          state.id = id;
          state.editDraft = editDraft;
          state.entryPoint = entryPoint;
        });
      },
      setEntryPoint: (entryPoint: "new" | "toUpdate") => {
        set((state) => {
          state.entryPoint = entryPoint;
        });
      },
    })),
    {
      name: "edit-draft", // localStorage 키 이름
    },
  ),
);
