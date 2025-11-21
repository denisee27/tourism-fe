import { create } from "zustand";

export const useStoreConvo = create((set, get) => ({
    conversations: true,
    setConversationAi: () => {
        const newState = !get().conversations;
        set({ conversations: newState });
    },
}));