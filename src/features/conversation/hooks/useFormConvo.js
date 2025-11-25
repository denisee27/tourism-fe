import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { convoSession, createConvo, getKeyPoint } from "../api"
import { useCreateMutation } from "../../../core/queries/mutationHelpers"

export const useConvo = () => {
    return useCreateMutation({
        queryKey: ["createConvo"],
        showSuccessToast: false,
        mutationFn: ({ data, sessionId }) => createConvo(data, sessionId),
    })
}

export const useFormSession = () => {
    return useCreateMutation({
        queryKey: ["convoSession"],
        showSuccessToast: false,
        mutationFn: () => convoSession(),
    })
}

export const useKeyPoint = (options = {}) => {
    const { enabled = true, sessionId: sessionIdOpt } = options;
    const sessionId = sessionIdOpt ?? (typeof window !== 'undefined' ? localStorage.getItem("sessionId") : undefined);
    return useQuery({
        queryKey: ["keyPoint", sessionId],
        queryFn: () => getKeyPoint(),
        showSuccessToast: false,
        placeholderData: keepPreviousData,
        enabled: enabled && !!sessionId,
    })
}