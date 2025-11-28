import { z } from "zod";

export const authRegisterSchemas = z
  .object({
    email: z
      .string()
      .email()
      .min(1, { message: "Email is required" })
      .max(100, { message: "Email must be less than 100 characters" }),
    phone_numer: z
      .string()
      .min(1, { message: "Phone number is required" })
      .max(12, { message: "Phone number must be less than 12 characters" }),
    username: z
      .string()
      .min(1, { message: "Username is required" })
      .max(50, { message: "Username must be less than 50 characters" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(100, { message: "Password must be less than 100 characters" }),
    confirm_password: z
      .string()
      .min(8, { message: "Confirm password must be at least 8 characters" })
      .max(100, {
        message: "Confirm password must be less than 100 characters",
      }),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

export type AuthRegisterTypes = z.infer<typeof authRegisterSchemas>;

export const authLoginSchema = z.object({
  email_or_phone: z
    .string()
    .min(1, { message: "Email or phone number is required" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
});

export type AuthLoginTypes = z.infer<typeof authLoginSchema>;