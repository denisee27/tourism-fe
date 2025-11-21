import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api";
import useUIStore from "../../../core/stores/uiStore";
import logger from "../../../core/utils/logger";
import { useNavigate } from "react-router-dom";

export const useRegister = () => {
  const navigate = useNavigate();
  const showSuccess = useUIStore((state) => state.showSuccess);
  const showError = useUIStore((state) => state.showError);

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      const message =
        data?.message ||
        data?.userMessage ||
        "Please check your email to verify your account";
      showSuccess(message);
      logger.info("Registration completed, redirecting to login");
      navigate("/", { replace: true });
    },
    onError: (error) => {
      logger.warn("Registration failed", error);
      showError(error?.message || "Registration failed. Please check your details.");
    },
  });
};
