import { z } from "zod";

/**
 * Environment variable schema using Zod for validation
 * Add new environment variables here as your app grows
 */
const envSchema = z.object({
  // API Configuration
  VITE_API_BASE_URL: z
    .string()
    .url("VITE_API_BASE_URL must be a valid URL")
    .describe("Base URL for API requests"),

  // Environment
  VITE_ENV: z
    .enum(["development", "staging", "production"])
    .default("development")
    .describe("Current environment"),

  // Optional: Enable/disable features
  VITE_ENABLE_DEVTOOLS: z
    .string()
    .transform((val) => val === "true")
    .default("true")
    .describe("Enable React Query DevTools"),

  // Optional: Logging level
  VITE_LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error"])
    .default("info")
    .describe("Logging level for the application"),
});

/**
 * Validates environment variables and returns typed config
 * Throws error if validation fails
 */
const runtimeEnv =
  (typeof import.meta !== "undefined" && import.meta.env) ||
  (typeof process !== "undefined" && process.env) ||
  {};

function validateEnv() {
  try {
    const env = {
      VITE_API_BASE_URL: runtimeEnv.VITE_API_BASE_URL,
      VITE_ENV: runtimeEnv.VITE_ENV || runtimeEnv.MODE,
      VITE_ENABLE_DEVTOOLS: runtimeEnv.VITE_ENABLE_DEVTOOLS,
      VITE_LOG_LEVEL: runtimeEnv.VITE_LOG_LEVEL,
    };

    const validated = envSchema.parse(env);

    // Log successful validation (only in dev)
    if (validated.VITE_ENV === "development") {
      console.log("Environment variables validated successfully");
      console.log(`Environment: ${validated.VITE_ENV}`);
      console.log(`API Base URL: ${validated.VITE_API_BASE_URL}`);
    }

    return validated;
  } catch (error) {
    console.error("Invalid environment variables:");

    if (error instanceof z.ZodError) {
      (error.errors ?? []).forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    }

    // helper error message
    console.error("\nFix: Create a .env file in the project root with:");
    console.error("VITE_API_BASE_URL=http://localhost:3000/api/v1");
    console.error("VITE_ENV=development");

    throw new Error("Environment validation failed. Check console for details.");
  }
}

/**
 * Validated and typed environment configuration
 * Use this throughout your app instead of import.meta.env
 *
 * @example
 * import { env } from '@/core/config/env';
 * const apiUrl = env.VITE_API_BASE_URL;
 */
export const env = validateEnv();

/**
 * Helper to check if we're in development
 */
export const isDevelopment = env.VITE_ENV === "development";

/**
 * Helper to check if we're in production
 */
export const isProduction = env.VITE_ENV === "production";

/**
 * Helper to check if we're in staging
 */
export const isStaging = env.VITE_ENV === "staging";
