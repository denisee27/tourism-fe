import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getListConvo } from "../api/index.js";

export const useSidebar = (filters = {}, options = {}) => {
    return useQuery({
        queryKey: ["dataConvo"],
        queryFn: () => getListConvo(filters),
        placeholderData: keepPreviousData,
        ...options,
    });
};