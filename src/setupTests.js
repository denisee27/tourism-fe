import "@testing-library/jest-dom/vitest";

// Ensure env validation passes in tests by seeding process.env.
process.env.VITE_API_BASE_URL = process.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
process.env.VITE_ENV = process.env.VITE_ENV || "test";
process.env.VITE_ENABLE_DEVTOOLS = process.env.VITE_ENABLE_DEVTOOLS || "false";
process.env.VITE_LOG_LEVEL = process.env.VITE_LOG_LEVEL || "error";
