# 블로그 에디터의 임시저장, localStorage에서 IndexedDB로 마이그레이션하다

## localStorage의 한계와 크래시의 원인

긴 블로그 글을 작성하다 보면 앱이 순간적으로 멈추거나 심하면 크래시되는 현상을 겪었다. 원인을 추적해보니 localStorage에 대용량 데이터를 저장할 때 발생하는 직렬화 과정이 문제였다.

localStorage는 동기적으로 동작한다. 즉, JSON.stringify()로 데이터를 직렬화하고 저장하는 동안 메인 스레드가 블로킹된다. BlockNote 에디터의 복잡한 문서 구조를 직렬화하면 콜스택에 부하가 걸리고, 이는 UI 프리징으로 이어진다. 사용자가 타이핑하는 도중에 임시저장이 트리거되면 입력이 끊기는 불편함이 발생했고, 글이 길어질수록 이 현상은 더 심해졌다.

## IndexedDB가 적합한 이유

IndexedDB는 이런 문제를 근본적으로 해결할 수 있는 대안이다. 가장 큰 차이점은 **비동기 처리**다. 모든 읽기/쓰기 작업이 비동기로 처리되기 때문에 메인 스레드를 차단하지 않는다. 사용자는 저장 작업이 백그라운드에서 진행되는 동안에도 자유롭게 타이핑을 계속할 수 있다.

또한 IndexedDB는 비관계형 문서 데이터베이스처럼 동작한다. BlockNote의 복잡한 문서 구조를 그대로 객체 형태로 저장할 수 있고, 트랜잭션 기반으로 데이터 무결성도 보장된다. 저장 용량도 localStorage의 5-10MB 제한과 달리 훨씬 여유롭다(브라우저마다 다르지만 보통 수백 MB 이상).

## IndexedDB vs localStorage

간단히 비교하면 이렇다:

| 특성 | localStorage | IndexedDB |
|------|--------------|-----------|
| 처리 방식 | 동기 (Synchronous) | 비동기 (Asynchronous) |
| 데이터 타입 | 문자열만 가능 | 객체, Blob 등 다양한 타입 |
| 용량 | 5-10MB | 수백 MB 이상 |
| 인덱싱 | 불가능 | 가능 (빠른 검색) |
| 트랜잭션 | 없음 | 지원 |

localStorage는 설정값이나 간단한 플래그를 저장하기에는 충분하지만, 복잡한 문서 구조를 저장하기에는 부적합하다.

## 구현: 이 앱에서 IndexedDB의 생애주기

[indexedDB.ts](src/lib/indexedDB.ts)에서 전체 구현을 확인할 수 있다.

### 1. 데이터베이스 초기화

앱이 처음 로드되거나 임시저장 기능이 호출되면 `initDB()`가 실행된다:

```typescript
const DB_NAME = "BumangBlogDB";
const DB_VERSION = 1;
const STORE_NAME = "drafts";

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });

        // 최신순 정렬을 위한 인덱스
        objectStore.createIndex("lastUpdatedAt", "lastUpdatedAt", {
          unique: false,
        });
      }
    };
  });
};
```

`drafts`라는 object store를 생성하고, `lastUpdatedAt` 필드에 인덱스를 걸어 최신 작성 글부터 조회할 수 있게 했다.

### 2. Draft 저장

사용자가 글을 작성하면 주기적으로 또는 특정 이벤트 시점에 `saveDraft()`가 호출된다:

```typescript
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
```

`put()` 메서드를 사용해 같은 ID가 있으면 업데이트하고, 없으면 새로 생성한다. 저장 시점의 타임스탬프를 자동으로 기록한다.

### 3. Draft 조회

사용자가 임시저장 목록을 열면 `getAllDrafts()`로 전체 목록을 가져온다:

```typescript
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
  });
};
```

커서를 이용해 인덱스를 역순("prev")으로 순회하면서 최신 글부터 리스트에 담는다.

### 4. Draft 삭제

사용자가 임시저장을 게시하거나 불필요한 draft를 제거하면 `deleteDraft()` 또는 `clearAllDrafts()`가 호출된다:

```typescript
export const deleteDraft = async (id: number): Promise<void> => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
  });
};
```

트랜잭션 내에서 삭제가 처리되므로 중간에 에러가 발생해도 데이터 정합성이 유지된다.

### 생애주기 요약

```
1. 앱 로드 → initDB() 호출 → DB/Store 생성
2. 사용자 타이핑 → saveDraft() 주기적 호출 → 비동기 저장
3. 임시저장 목록 열기 → getAllDrafts() → 최신순 조회
4. Draft 불러오기 → getDraft(id) → 특정 Draft 복원
5. 게시 또는 삭제 → deleteDraft(id) → Draft 제거
```

모든 작업이 Promise 기반 비동기로 처리되어 UI 블로킹이 전혀 없다.

## 마무리

localStorage에서 IndexedDB로 마이그레이션한 후 임시저장 기능은 훨씬 안정적이고 빠르게 동작한다. 긴 글을 작성할 때도 프리징 없이 부드럽게 저장되고, 앱 크래시는 완전히 사라졌다.

단순히 기술 스택을 바꾼 것이 아니라, 사용자 경험을 개선하는 본질적인 문제 해결이었다. 웹 앱에서 대용량 데이터를 다룬다면 IndexedDB를 적극 고려해볼 만하다.
