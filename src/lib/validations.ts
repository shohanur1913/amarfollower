import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^01\d{9}$/, "Phone must be 11 digits starting with 01").optional().or(z.literal("")),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const newOrderSchema = z.object({
  serviceId: z.number().min(1, "Please select a service"),
  link: z.string().url("Please enter a valid URL"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

export const ticketSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^01\d{9}$/, "Phone must be 11 digits starting with 01").optional().or(z.literal("")),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
});

export const massOrderSchema = z.object({
  orders: z
    .string()
    .min(1, "Orders text is required")
    .refine(
      (val) => val.split("\n").filter((l) => l.trim()).length > 0,
      "At least one order is required"
    ),
});

export const adminSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteUrl: z.string().url("Invalid URL"),
  currency: z.string().min(1, "Currency is required"),
  minBalance: z.coerce.number().min(0, "Must be >= 0"),
  smtpHost: z.string().optional(),
  smtpPort: z.coerce.number().optional(),
  smtpUser: z.string().optional(),
  smtpPass: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email or phone is required"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset code is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type NewOrderInput = z.infer<typeof newOrderSchema>;
export type TicketInput = z.infer<typeof ticketSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type MassOrderInput = z.infer<typeof massOrderSchema>;
export type AdminSettingsInput = z.infer<typeof adminSettingsSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
