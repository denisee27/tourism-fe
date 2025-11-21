import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { convoSession, createConvo, getKeyPoint } from "../api"
import { useCreateMutation } from "../../../core/queries/mutationHelpers"

export const useConvo = () => {
    return useCreateMutation({
        queryKey: ["createConvo"],
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
export const useKeyPoint = () => {
    return useQuery({
        queryKey: ["keyPoint"],
        queryFn: () => getKeyPoint(),
        placeholderData: keepPreviousData,
    })
}