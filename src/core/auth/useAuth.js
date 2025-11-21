import { useAuthStore } from "../../features/auth/stores/authStore";

export const useAuth = () => {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  return {
    status, //We consider 'idle' as a loading state because the app might be starting up and hasn't determined the auth status yet.
    user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading" || status === "idle",
  };
};
