import { z } from "zod";

export const conversationSchema = z.object({
  from: z
    .string()
    .trim()
    .min(2, { message: "Kolom From wajib diisi dan minimal 2 karakter" })
    .max(100, { message: "Kolom From maksimal 100 karakter" }),

  to: z
    .string()
    .trim()
    .min(2, { message: "Kolom To wajib diisi dan minimal 2 karakter" })
    .max(100, { message: "Kolom To maksimal 100 karakter" }),

  when: z
    .string()
    .trim()
    .min(3, { message: "Kolom When wajib diisi" })
    .max(100, { message: "Kolom When maksimal 100 karakter" }),

  duration: z
    .string()
    .trim()
    .min(1, { message: "Kolom Duration wajib diisi" })
    .max(50, { message: "Kolom Duration maksimal 50 karakter" })
    .refine((val) => /\d/.test(val), {
      message: "Duration harus menyertakan angka (misal: '7 hari')",
    }),

  preference: z
    .string()
    .trim()
    .min(3, { message: "Kolom Preference wajib diisi" })
    .max(200, { message: "Kolom Preference maksimal 200 karakter" }),

  numberOfPeople: z
    .string()
    .trim()
    .min(1, { message: "Kolom Number of People wajib diisi" })
    .refine((val) => /^\d+$/.test(val), {
      message: "Number of People harus berupa angka bulat yang valid",
    })
    .transform((val) => parseInt(val, 10))
    .refine((n) => n >= 1 && n <= 100, {
      message: "Number of People harus antara 1 sampai 100",
    }),

  transportation: z
    .string()
    .trim()
    .min(2, { message: "Kolom Transportation wajib diisi dan minimal 2 karakter" })
    .max(50, { message: "Kolom Transportation maksimal 50 karakter" }),

  estimatedBudget: z
    .string()
    .trim()
    .min(1, { message: "Kolom Estimated Budget wajib diisi" })
    .refine((val) => /^[\d\s,]+$/.test(val), {
      message: "Estimated Budget harus berupa angka yang valid",
    })
    .transform((val) => parseInt(val.replace(/[\,\s]/g, ""), 10))
    .refine((n) => !Number.isNaN(n) && n >= 0, {
      message: "Estimated Budget harus angka >= 0",
    }),
});

export default conversationSchema;