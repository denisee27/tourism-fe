import { create } from "zustand";

export const useStoreConvo = create((set, get) => ({
    conversations: localStorage.getItem("sessionId") !== null,
    summary: false,
    setConversationAi: (value) => {
        set({ conversations: value });
    },
    setSummary: (value) => {
        set({ summary: value });
    },
}));