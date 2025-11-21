import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { authApi } from "../api";
import { useUIStore } from "../../../core/stores/uiStore";
import logger from "../../../core/utils/logger";
export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const showSuccess = useUIStore((state) => state.showSuccess);
  const showError = useUIStore((state) => state.showError);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      const { user, accessToken } = data;
      setAuth({ user, accessToken });
      showSuccess(`Welcome back, ${user.name || user.email}!`);
      logger.info("user", accessToken);
      navigate("/");
    },
    onError: (error) => {
      logger.warn("Login failed", error);
      logger.info("error", error);
      showError(error.message || "Login failed. Please check your credentials.");
    },
  });
};
