import { create } from "zustand";

export const useStoreConvo = create((set, get) => ({
  conversations: localStorage.getItem("sessionId") !== null,
  summary: false,
  messages: [],
  isFirstConversation: false,
  setConversationAi: (value) => {
    set({ conversations: value });
  },
  setSummary: (value) => {
    set({ summary: value });
  },
  addMessage: (message) => {
    set((state) => {
      const newMessages = [...state.messages];
      const lastMessage = newMessages[newMessages.length - 1];

      // Jika pesan terakhir adalah 'loading' dan pesan baru adalah dari 'model', ganti.
      if (lastMessage && lastMessage.role === "loading" && message.role === "model") {
        newMessages[newMessages.length - 1] = message;
      } else {
        // Jika tidak, tambahkan pesan baru.
        newMessages.push(message);
      }

      return { messages: newMessages };
    });
  },
  setMessages: (messages) => set({ messages }),
  SetIsFirstConversation: (isFirstConversation) =>
    set({ isFirstConversation: !isFirstConversation }),
}));
