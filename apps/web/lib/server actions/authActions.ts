"use server";

import { AuthRegisterTypes } from "@repo/validators";
import { authRegisterSchemas } from "@repo/validators";
import { apiClient } from "@/lib/api/client";

export async function authRegisterAction(values: AuthRegisterTypes) {
  const validationResult = authRegisterSchemas.safeParse(values);

  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0];
    return {
      success: false,
      error: firstError?.message || "Validation failed",
    };
  }

  try {
    const user = await apiClient.createUser({
      email: values.email,
      username: values.username,
      phone_numer: values.phone_numer,
      password: values.password,
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        phone_numer: user.phone_numer,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
    };
  }
}
