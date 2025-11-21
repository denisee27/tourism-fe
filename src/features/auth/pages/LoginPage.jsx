import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useNavigation } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { loginSchema } from "../utils/validation";
import { useLogin } from "../hooks/useLogin";
import imageDemo from "../../../assets/demo_page.webp";
import logger from "../../../core/utils/logger";
import { Plane } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const { mutate: performLogin, isPending, error } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  // The submit handler is now just one line!
  const onSubmit = (data) => {
    logger.info("calling data");
    performLogin(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full min-w-xs max-w-1/2 md:max-w-1/2 md:min-w-1/2 rounded-lg ms-2  md:ms-0 me-2 md:me-0 flex justify-center items-center">
        <div className="bg-white md:w-md p-6 rounded-xl border border-border">
          <div>
            <div className="flex justify-center items-center gap-2 text-center mb-4">
              <Plane className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">TravelMind</span>
            </div>
            <h2 className="text-center text-2xl font-bold">Welcome Back</h2>
            <span className="text-muted-foreground text-sm/6 text-center block py-1">Sign in to continue planning your trips</span>
            <form onSubmit={handleSubmit(onSubmit)}>
              {serverError && (
                <p className="mb-4 text-center text-sm text-red-600">{serverError}</p>
              )}
              <div className="mb-4 mt-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  {...register("email")}
                  type="text"
                  className="mt-1 h-8 px-2 block w-full rounded-md border-border border shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  {...register("password")}
                  type="password"
                  className="mt-1 px-2 h-8 block w-full rounded-md border-border border shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-md bg-primary px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 focus:outline-orange-300 hover:cursor-pointer"
              >
                {isPending ? "Logging in..." : "Login"}
              </button>
              <span className="text-muted-foreground text-sm/6 text-center block mt-4 mb-5">Don't have an account? <span onClick={() => navigate("/register")} className="text-accent hover:cursor-pointer">Sign up</span></span>
            </form>
          </div>
          <hr className="my-6 border-border" />
          <div className="flex justify-between mt-2 text-blue-200 ">
            <span className="text-primary mx-auto text-center block hover:text-blue-700 cursor-pointer" onClick={() => navigate("/")}>
              ← Back to Home
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
