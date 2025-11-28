"use client";
import { useState } from "react";
import AuthRegisterForm from "./AuthRegisterForm";
import AuthLoginForm from "./AuthLoginForm";

export default function AuthClient() {
  const [content, setContent] = useState<"register" | "login">("login");

  return (
    <>
      {content === "register" ? (
        <AuthRegisterForm />
      ) : (
        <AuthLoginForm setContent={setContent} />
      )}
    </>
  );
}
