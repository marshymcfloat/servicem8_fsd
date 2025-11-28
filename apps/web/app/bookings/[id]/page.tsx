import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth/authOptions";
import { BookingDetail } from "@/components/bookings/BookingDetail";
import { SignOutButton } from "@/components/bookings/SignOutButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const { id: bookingId } = await params;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" asChild>
            <Link href="/bookings">← Back to Bookings</Link>
          </Button>
          <SignOutButton />
        </div>
        <BookingDetail bookingId={bookingId} />
      </div>
    </div>
  );
}


