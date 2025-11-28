import { Suspense } from "react";
import { getServerBookings } from "@/lib/api/server";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { BookingsListSkeleton } from "./BookingsListSkeleton";
import type { Booking } from "@/lib/api/client";

async function BookingsData() {
  let bookings;
  try {
    bookings = await getServerBookings();
  } catch (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-600 mb-2">
          Error loading bookings from ServiceM8
        </p>
        <p className="text-sm text-slate-600">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </Card>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-slate-600">No bookings found.</p>
        <p className="text-sm text-slate-500 mt-2">
          Make sure your email matches a customer in ServiceM8.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {bookings.map((booking) => (
        <Link key={booking.id} href={`/bookings/${booking.id}`}>
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {booking.title}
                </h2>
                <p className="text-slate-600 mb-1">
                  Job #: {booking.jobNumber}
                </p>
                <p className="text-slate-600 mb-1">
                  Status: {booking.status}
                </p>
                {booking.address && (
                  <p className="text-slate-600">
                    {booking.address}, {booking.city}, {booking.state}
                  </p>
                )}
              </div>
              {booking.scheduledStart && (
                <div className="text-right text-sm text-slate-600">
                  <p>
                    {new Date(booking.scheduledStart).toLocaleDateString()}
                  </p>
                  <p>
                    {new Date(booking.scheduledStart).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export function BookingsList() {
  return (
    <Suspense fallback={<BookingsListSkeleton />}>
      <BookingsData />
    </Suspense>
  );
}

