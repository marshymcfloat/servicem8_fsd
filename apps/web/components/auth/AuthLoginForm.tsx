import { zodResolver } from "@hookform/resolvers/zod";
import { authLoginSchema, AuthLoginTypes } from "@repo/validators";
import React from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

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

  const { mutate: handleLogin, isPending } = useMutation({
    mutationFn: async (data: AuthLoginTypes) => {
      const result = await signIn("credentials", {
        email_or_phone: data.email_or_phone,
        password: data.password,
        redirect: false,
      });

      if (!result) {
        throw new Error("No response from server");
      }

      if (!result.ok) {
        throw new Error(result.error || "Login failed");
      }

      return result;
    },
    onSuccess: () => {
      toast.success("Login successful! Redirecting...");
      router.push("/bookings");
      router.refresh();
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      toast.error(errorMessage);
      form.setError("root", { message: errorMessage });
    },
  });

  const onSubmit = (data: AuthLoginTypes) => {
    handleLogin(data);
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
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <LoaderCircle className="animate-spin mr-2" />}
            {isPending ? "Logging in..." : "Login"}
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
