import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type GridMode = "compact" | "comfortable" | "cover";

type DisplayModeState = {
  mode: GridMode;
  setMode: (mode: GridMode) => void;
};

export const useDisplayMode = create<DisplayModeState>()(
  persist(
    (set) => ({
      mode: "compact" as GridMode,
      setMode: (mode: GridMode) => set({ mode }),
    }),
    {
      name: "display-mode",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
