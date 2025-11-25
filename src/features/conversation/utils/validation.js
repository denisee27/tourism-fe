import { z } from "zod";

export const conversationSchema = z.object({
  from: z
    .string()
    .trim()
    .min(2, { message: "Origin is required and must be at least 2 characters" })
    .max(100, { message: "Origin must not exceed 100 characters" }),

  to: z
    .string()
    .trim()
    .min(2, { message: "Destination is required and must be at least 2 characters" })
    .max(100, { message: "Destination must not exceed 100 characters" }),

  when: z
    .string()
    .trim()
    .min(3, { message: "Travel date is required" })
    .max(100, { message: "Travel date must not exceed 100 characters" }),

  duration: z
    .string()
    .trim()
    .min(1, { message: "Duration is required" })
    .max(50, { message: "Duration must not exceed 50 characters" })
    .refine((val) => /\d/.test(val), {
      message: "Duration must include a number (e.g., '7 days')",
    }),

  preference: z
    .string()
    .trim()
    .min(3, { message: "Preference is required" })
    .max(200, { message: "Preference must not exceed 200 characters" }),

  numberOfPeople: z
    .string()
    .trim()
    .min(1, { message: "Number of people is required" })
    .transform((val) => parseInt(val, 10)),

  transportation: z
    .string()
    .trim()
    .min(2, { message: "Transportation is required and must be at least 2 characters" })
    .max(50, { message: "Transportation must not exceed 50 characters" }),

  estimatedBudget: z
    .string()
    .trim()
    .min(1, { message: "Estimated budget is required" })
    .transform((val) => parseInt(val.replace(/[\,\s]/g, ""), 10))
});

export default conversationSchema;