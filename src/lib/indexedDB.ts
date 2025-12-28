/**
 * IndexedDB utility for managing blog drafts
 */

import { PartialBlock } from "@blocknote/core";
import { CategoryType, GroupType, TagType } from "@/types";

// Draft 타입 (BlockNote 전용)
export interface DraftData {
  id: number;
  title: string;
  content: PartialBlock[]; // BlockNote document
  selectedGroup: GroupType | null;
  selectedCategory: CategoryType | null;
  selectedTags: TagType[];
  lastUpdatedAt: string;
}

const DB_NAME = "BumangBlogDB";
const DB_VERSION = 1;
const STORE_NAME = "drafts";

let dbInstance: IDBDatabase | null = null;

/**
 * IndexedDB 초기화
 */
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("IndexedDB 초기화 실패"));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // drafts store가 없으면 생성
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });

        // lastUpdatedAt으로 인덱스 생성 (정렬용)
        objectStore.createIndex("lastUpdatedAt", "lastUpdatedAt", {
          unique: false,
        });
      }
    };
  });
};

/**
 * Draft 저장
 */
export const saveDraft = async (draft: DraftData): Promise<void> => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.put({
      ...draft,
      lastUpdatedAt: new Date().toISOString(),
    });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Draft 저장 실패"));
  });
};

/**
 * Draft ID로 조회
 */
export const getDraft = async (id: number): Promise<DraftData | null> => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => reject(new Error("Draft 조회 실패"));
  });
};

/**
 * 모든 Draft 조회 (최신순)
 */
export const getAllDrafts = async (): Promise<DraftData[]> => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("lastUpdatedAt");

    // 최신순으로 가져오기
    const request = index.openCursor(null, "prev");
    const drafts: DraftData[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        drafts.push(cursor.value);
        cursor.continue();
      } else {
        resolve(drafts);
      }
    };

    request.onerror = () => reject(new Error("Draft 목록 조회 실패"));
  });
};

/**
 * Draft 삭제
 */
export const deleteDraft = async (id: number): Promise<void> => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Draft 삭제 실패"));
  });
};

/**
 * 모든 Draft 삭제
 */
export const clearAllDrafts = async (): Promise<void> => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("모든 Draft 삭제 실패"));
  });
};

/**
 * 가장 최근 Draft 조회
 */
export const getLatestDraft = async (): Promise<DraftData | null> => {
  const drafts = await getAllDrafts();
  return drafts.length > 0 ? drafts[0] : null;
};
