import { zodResolver } from "@hookform/resolvers/zod";
import { authLoginSchema, AuthLoginTypes } from "@repo/validators";
import React from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { authRegisterAction } from "@/lib/server actions/authActions";

export default function AuthLoginForm({
  setContent,
}: {
  setContent: (content: "register" | "login") => void;
}) {
  const form = useForm<AuthLoginTypes>({
    resolver: zodResolver(authLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: authRegisterAction,
    onSuccess: (data) => {},
  });

  const formInputs = Object.keys(form.getValues()) as (keyof AuthLoginTypes)[];

  return (
    <Form {...form}>
      <form className="space-y-4">
        {formInputs.map((input) => (
          <FormField
            control={form.control}
            key={input}
            name={input}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="capitalize">{input}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type={input === "email" ? "email" : "password"}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ))}
        <div className="flex flex-col gap-2 mt-12">
          <Button type="submit" className="w-full">
            Login
          </Button>
          <Button variant={"ghost"} onClick={() => setContent("register")}>
            Register
          </Button>
        </div>
      </form>
    </Form>
  );
}
