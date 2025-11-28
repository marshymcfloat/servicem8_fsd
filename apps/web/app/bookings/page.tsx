import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth/authOptions";
import { BookingsList } from "@/components/bookings/BookingsList";
import { SignOutButton } from "@/components/bookings/SignOutButton";

export default async function BookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <SignOutButton />
        </div>
        <BookingsList />
      </div>
    </div>
  );
}
