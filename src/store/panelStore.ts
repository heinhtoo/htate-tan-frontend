import { create } from "zustand";

interface PanelState {
  isPanelOpen: boolean;
  panelContent: React.ReactNode | null;
  title: string;
  openPanel: ({
    title,
    content,
  }: {
    title: string;
    content: React.ReactNode;
  }) => void;
  closePanel: () => void;
}

export const usePanelStore = create<PanelState>((set) => ({
  isPanelOpen: false,
  panelContent: null,
  title: "",
  openPanel: ({ title, content }) => {
    set({ title, panelContent: content, isPanelOpen: true });
  },
  closePanel: () => {
    console.log("HERE");
    set({ isPanelOpen: false, title: "", panelContent: null });
  },
}));
