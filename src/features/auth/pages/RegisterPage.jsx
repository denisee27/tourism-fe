import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { registerSchema } from "../utils/validation";
import { useRegister } from "./../hooks/useRegister";
import logger from "../../../core/utils/logger";
import { useNavigate } from "react-router-dom";
import { Plane } from "lucide-react";

export default function RegisterPage() {
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const { mutateAsync: registerUser, isPending } = useRegister();

  const onSubmit = async (data) => {
    setServerError("");
    logger.info("Submitting registration form", data);
    try {
      await registerUser(data);
    } catch (err) {
      setServerError(err?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="w-min-full min-h-screen md:flex md:flex-row">
      <div className="flex justify-center items-center h-screen w-full">
        <div className="bg-white p-8 rounded-xl w-full max-w-md border border-border">
          <div className="flex justify-center items-center gap-2 text-center mb-4">
            <Plane className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">TravelMind</span>
          </div>
          <h1 className="text-center text-2xl font-bold">Welcome To TravelMind</h1>
          <p className="text-center">Please register to use this app</p>

          {serverError && <p className="mb-3 text-center text-sm text-red-600">{serverError}</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-3 space-y-4">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">Full name</label>
              <input
                {...register("name")}
                type="text"
                className="mt-1 px-2 h-8 block w-full rounded-md border-border border shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                {...register("email")}
                type="text"
                className="mt-1 px-2 h-8 block w-full rounded-md border-border border shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div className="mb-3">
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
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                {...register("confirmPassword")}
                type="password"
                className="mt-1 px-2 h-8 block w-full rounded-md border-border border shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-md bg-primary px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 focus:outline-orange-300 hover:cursor-pointer"
            >
              {isPending ? "Registering..." : "Register"}
            </button>
          </form>
          <span className="text-muted-foreground text-sm/6 text-center block mt-4 mb-2">have an account? <span onClick={() => navigate("/login")} className="text-accent hover:cursor-pointer">Sign in</span></span>
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
