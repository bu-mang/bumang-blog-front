import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { PartialBlock } from "@blocknote/core";
import { RoleType } from "@/types/user";

interface EditDraftType {
  title: string;
  content: PartialBlock[] | undefined;
  selectedGroup: { id: number; label: string } | null;
  selectedCategory: { id: number; label: string } | null;
  selectedTags: { id: number; label: string }[];
  readPermission?: RoleType;
}

interface EditState {
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

/**
 * @useEditStore
 * 블로그 포스트 수정 모드 진입 시 기존 포스트 데이터를 임시로 저장하는 store
 *
 * 사용 흐름:
 * 1. 포스트 상세 페이지 → "수정" 버튼 클릭
 * 2. handleSetDraft()에서 현재 포스트 데이터를 setAllEditState()로 저장
 * 3. 수정 페이지(/blog/edit?id=xxx)로 이동
 * 4. 수정 페이지에서 editDraft를 읽어와 title, category, tags, readPermission 등 초기값 설정
 *
 * 참고: 메모리에만 저장되며 페이지 새로고침 시 초기화됨
 */
export const useEditStore = create<EditState & EditAction>()(
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
);
