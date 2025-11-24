import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getListConvo } from "../api/index.js";

export const useSidebar = (filters = {}, options = {}) => {
    const { page = 1, limit = 10 } = filters;
    return useQuery({
        queryKey: ["dataConvo", page, limit],
        queryFn: () => getListConvo({ page, limit }),
        placeholderData: keepPreviousData,
        ...options,
    });
};