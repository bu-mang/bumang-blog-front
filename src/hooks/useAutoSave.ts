import { useEffect, useRef, useCallback, useState } from "react";
import { saveDraft, DraftData } from "@/lib/indexedDB";

export type SaveStatus = "saved" | "saving" | "error" | "idle";

interface UseAutoSaveOptions {
  enabled: boolean;
  getData: () => DraftData;
  debounceMs?: number;
  maxWaitMs?: number;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

/**
 * Auto-save hook with debouncing
 *
 * @example
 * const { saveStatus, emergencySave } = useAutoSave({
 *   enabled: true,
 *   getData: () => ({
 *     id: draftId,
 *     title,
 *     content: editor.document,
 *     selectedGroup,
 *     selectedCategory,
 *     selectedTags,
 *   }),
 *   debounceMs: 2000,
 * });
 */
export function useAutoSave({
  enabled,
  getData,
  debounceMs = 2000,
  maxWaitMs = 30000,
  onSaveSuccess,
  onSaveError,
}: UseAutoSaveOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxWaitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveAttemptRef = useRef<Date | null>(null);
  const dataRef = useRef<string>("");

  /**
   * 실제 저장 함수
   */
  const performSave = useCallback(async () => {
    try {
      setSaveStatus("saving");
      const data = getData();
      await saveDraft(data);

      setSaveStatus("saved");
      setLastSavedAt(new Date());
      lastSaveAttemptRef.current = new Date();

      onSaveSuccess?.();
    } catch (error) {
      console.error("Auto-save failed:", error);
      setSaveStatus("error");
      onSaveError?.(error as Error);
    }
  }, [getData, onSaveSuccess, onSaveError]);

  /**
   * 긴급 저장 (Error Boundary에서 호출용)
   * Debounce 무시하고 즉시 저장
   */
  const emergencySave = useCallback(async () => {
    // 진행 중인 타이머 모두 취소
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (maxWaitTimerRef.current) {
      clearTimeout(maxWaitTimerRef.current);
      maxWaitTimerRef.current = null;
    }

    await performSave();
  }, [performSave]);

  /**
   * Debounced save 트리거
   */
  const triggerSave = useCallback(() => {
    if (!enabled) return;

    // 기존 debounce 타이머 취소
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 새 debounce 타이머 시작
    debounceTimerRef.current = setTimeout(() => {
      performSave();

      // max wait 타이머도 취소
      if (maxWaitTimerRef.current) {
        clearTimeout(maxWaitTimerRef.current);
        maxWaitTimerRef.current = null;
      }
    }, debounceMs);

    // Max wait 타이머 설정 (처음 한 번만)
    if (!maxWaitTimerRef.current) {
      maxWaitTimerRef.current = setTimeout(() => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        performSave();
      }, maxWaitMs);
    }
  }, [enabled, debounceMs, maxWaitMs, performSave]);

  /**
   * 데이터 변경 감지
   */
  useEffect(() => {
    if (!enabled) return;

    const currentData = JSON.stringify(getData());

    // 데이터가 실제로 변경되었을 때만 저장 트리거
    if (currentData !== dataRef.current && currentData !== "{}") {
      dataRef.current = currentData;
      triggerSave();
    }
  }, [enabled, getData, triggerSave]);

  /**
   * Cleanup: 컴포넌트 언마운트 시 타이머 정리
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (maxWaitTimerRef.current) {
        clearTimeout(maxWaitTimerRef.current);
      }
    };
  }, []);

  return {
    saveStatus,
    lastSavedAt,
    emergencySave,
  };
}
