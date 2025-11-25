import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getEachConversation, pushMessage } from "../api";
import { useCreateMutation } from "../../core/queries/mutationHelpers";

export const useEachConversation = (options = {}) => {
    const sessionId = localStorage.getItem("sessionId");
    return useQuery({
        queryKey: ["eachConversation", sessionId],
        queryFn: () => getEachConversation(),
        enabled: Boolean(sessionId),
        placeholderData: keepPreviousData,
        staleTime: 15_000,
        gcTime: 5 * 60_000,
        ...options,
    });
};

export const usePushMessage = (options = {}) => {
    const sessionId = localStorage.getItem("sessionId");
    return useCreateMutation({
        queryKey: ["pushMessage", sessionId],
        mutationFn: pushMessage,
        showSuccessToast: false,
        showErrorToast: false,
        ...options,
    });
};