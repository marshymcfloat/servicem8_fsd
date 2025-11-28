"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();

  return (
    <Button onClick={() => router.push("/api/auth/signout")}>
      Sign Out
    </Button>
  );
}

