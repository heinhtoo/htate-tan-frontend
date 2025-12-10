import type { ErrorResponse } from "@/lib/actionHelper";
import { create } from "zustand";

export interface WarningState {
  title: string;
  description: string;
  onClickFn: () => void;
}
interface ErrorState {
  warningState: WarningState | null;
  error: ErrorResponse | null;
  setError: (error: ErrorResponse | null) => void;
  setWarningState: (warningState: WarningState) => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  warningState: null,
  error: null,
  setError: (error: ErrorResponse | null) => {
    set({ error });
  },
  setWarningState: (warningState: WarningState | null) => {
    set({ warningState });
  },
}));
