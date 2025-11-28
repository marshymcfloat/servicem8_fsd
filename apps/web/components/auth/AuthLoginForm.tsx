import { zodResolver } from "@hookform/resolvers/zod";
import { authLoginSchema, AuthLoginTypes } from "@repo/validators";
import React from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthLoginForm({
  setContent,
}: {
  setContent: (content: "register" | "login") => void;
}) {
  const router = useRouter();
  const form = useForm<AuthLoginTypes>({
    resolver: zodResolver(authLoginSchema),
    defaultValues: {
      email_or_phone: "",
      password: "",
    },
  });

  const onSubmit = async (data: AuthLoginTypes) => {
    try {
      const result = await signIn("credentials", {
        email_or_phone: data.email_or_phone,
        password: data.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/bookings");
        router.refresh();
      } else {
        form.setError("root", { message: result?.error || "Login failed" });
      }
    } catch (error) {
      form.setError("root", { message: "An error occurred" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email_or_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email or Phone Number</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="your@email.com or 1234567890"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" />
              </FormControl>
            </FormItem>
          )}
        />
        {form.formState.errors.root && (
          <p className="text-sm text-red-500">
            {form.formState.errors.root.message}
          </p>
        )}
        <div className="flex flex-col gap-2 mt-12">
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Logging in..." : "Login"}
          </Button>
          <Button
            type="button"
            variant={"ghost"}
            onClick={() => setContent("register")}
          >
            Register
          </Button>
        </div>
      </form>
    </Form>
  );
}
