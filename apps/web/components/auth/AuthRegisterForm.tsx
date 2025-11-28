"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { authRegisterSchemas, AuthRegisterTypes } from "@repo/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { authRegisterAction } from "@/lib/server actions/authActions";
import { LoaderCircle } from "lucide-react";
export default function AuthRegisterForm() {
  const form = useForm<AuthRegisterTypes>({
    resolver: zodResolver(authRegisterSchemas),
    defaultValues: {
      email: "",
      phone_numer: "",
      username: "",
      password: "",
      confirm_password: "",
    },
  });

  const formInputs = Object.keys(
    form.getValues()
  ) as (keyof AuthRegisterTypes)[];

  const { mutate, isPending } = useMutation({ mutationFn: authRegisterAction });

  function handleSubmission(values: AuthRegisterTypes) {
    mutate(values);
  }

  return (
    <Form {...form}>
      <form
        action=""
        onSubmit={form.handleSubmit(handleSubmission)}
        className="space-y-4 "
      >
        {formInputs.map((input) => (
          <FormField
            key={input}
            control={form.control}
            name={input}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="capitalize">
                  {input === "confirm_password"
                    ? "Confirm Password"
                    : input === "phone_numer"
                      ? "Phone Number"
                      : input}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type={
                      input === "email"
                        ? "email"
                        : input === "phone_numer"
                          ? "tel"
                          : input === "username"
                            ? "text"
                            : "password"
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ))}
        <div className="mt-12">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <LoaderCircle className="animate-spin" />}
            Register
          </Button>
        </div>
      </form>
    </Form>
  );
}
