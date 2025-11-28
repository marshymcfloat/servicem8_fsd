import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import AuthClient from "./AuthClient";

export default function AuthDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"ghost"}
          className="absolute top-4 right-4  cursor-pointer hover:bg-slate-200 "
        >
          Login
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Get started</DialogTitle>
        </DialogHeader>
        <AuthClient />
      </DialogContent>
    </Dialog>
  );
}
