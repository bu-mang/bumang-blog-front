// lib/store/useAuthStore.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type BackgroundItem = [number, "Ascii3DLily" | "HandDeepInside"];

/** 홈 배경을 처음 고를 때의 비율(백합 70 : 그림 30). 합이 100이 아니어도 비율로 나눈다. */
const HOME_BACKGROUND_WEIGHTS: Record<BackgroundItem[1], number> = {
  Ascii3DLily: 70,
  HandDeepInside: 30,
};

export function pickWeightedHomeBackground(list: BackgroundItem[]): number {
  const total = list.reduce(
    (sum, [, name]) => sum + HOME_BACKGROUND_WEIGHTS[name],
    0,
  );
  let roll = Math.random() * total;
  for (const [index, name] of list) {
    roll -= HOME_BACKGROUND_WEIGHTS[name];
    if (roll < 0) return index;
  }
  return list[0][0];
}

interface BackgroundState {
  backgroundColor: string | undefined | null; // tailwind Utils
  backgroundImage: string | undefined | null; // url or null

  home: {
    list: BackgroundItem[];
    // null = 아직 안 정함. 첫 방문 때 브라우저에서 비율대로 뽑는다(pickRandomItem).
    // 서버 렌더링 때 뽑으면 서버 화면과 브라우저 화면이 달라져 hydration이 어긋난다.
    selectedIndex: number | null;
  };

  work: {
    centerText: boolean;
  };
}

interface BackgroundAction {
  setBackgroundColor: (v: string | undefined | null) => void;
  setBackgroundImage: (v: string | undefined | null) => void;

  home: {
    setSelectedItem: (v: number) => void;
    /** 아직 안 정했을 때만 비율대로 뽑는다. 사용자가 푸터에서 고른 값은 덮어쓰지 않는다. */
    pickRandomItem: () => void;
  };

  work: {
    setCenterText: (v: boolean) => void;
  };
}

export const useBackgroundStore = create<BackgroundState & BackgroundAction>()(
  immer((set) => ({
    backgroundColor: null,
    backgroundImage: null,

    home: {
      list: [
        [0, "Ascii3DLily"],
        [1, "HandDeepInside"],
      ],
      selectedIndex: null,

      setSelectedItem: (selectedIndex: number) =>
        set((state) => {
          state.home.selectedIndex = selectedIndex;
        }),
      pickRandomItem: () =>
        set((state) => {
          if (state.home.selectedIndex !== null) return;
          state.home.selectedIndex = pickWeightedHomeBackground(
            state.home.list,
          );
        }),
    },

    work: {
      centerText: true,
      setCenterText: (isCenterText: boolean) =>
        set((state) => {
          state.work.centerText = isCenterText;
        }),
    },

    setBackgroundColor: (backgroundColor) =>
      set((state) => {
        state.backgroundColor = backgroundColor;
      }),
    setBackgroundImage: (backgroundImage) =>
      set((state) => {
        state.backgroundImage = backgroundImage;
      }),
  })),
);
