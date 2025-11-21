import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getEachConversation, pushMessage } from "../api";
import { useCreateMutation } from "../../core/queries/mutationHelpers";

export const useEachConversation = (sessionId, options = {}) => {
    return useQuery({
        queryKey: ["eachConversation", sessionId || "none"],
        queryFn: () => getEachConversation(),
        enabled: Boolean(sessionId),
        placeholderData: keepPreviousData,
        staleTime: 15_000,
        gcTime: 5 * 60_000,
        ...options,
    });
};

export const usePushMessage = (options = {}) => {
    return useCreateMutation({
        queryKey: ["eachConversation"],
        mutationFn: pushMessage,
        showSuccessToast: false,
        ...options,
    });
};