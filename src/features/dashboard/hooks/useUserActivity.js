import { useQuery } from "@tanstack/react-query";
import api from "../../../core/api/index.js";
import { dashboardKeys } from "../../../core/queries/queryKeys.js";
export const USER_ACTIVITY_ENDPOINT = "/stats/user-activity";

export const fetchUserActivity = async (filters) => {
  const params = filters ? { params: filters } : undefined;
  return api.get(USER_ACTIVITY_ENDPOINT, params);
};

export const useUserActivity = (filters, options = {}) => {
  return useQuery({
    queryKey: dashboardKeys.userActivity(filters),
    queryFn: () => fetchUserActivity(filters),
    staleTime: 1000 * 60, // 1 minute
    ...options,
  });
};

export default useUserActivity;
