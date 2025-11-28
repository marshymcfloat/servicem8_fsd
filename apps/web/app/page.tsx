import AuthDialog from "@/components/auth/AuthDialog";
import React from "react";

export default function page() {
  return (
    <main className="min-h-screen bg-linear-to-bl from-slate-100 to-slate-200 flex items-center justify-center">
      <AuthDialog />
      <h1 className="text-8xl tracking-widest text-slate-800/90 font-bold text-center">
        ServiceM8 FSD
      </h1>
    </main>
  );
}
