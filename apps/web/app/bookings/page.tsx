"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    data: bookings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bookings", session?.user?.email],
    queryFn: () =>
      apiClient.getBookings(session?.user?.email || undefined, undefined),
    enabled: status === "authenticated",
    retry: 1,
  });

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/api/auth/signout")}>
              Sign Out
            </Button>
          </div>
        </div>

        {error ? (
          <Card className="p-8 text-center">
            <p className="text-red-600 mb-2">
              Error loading bookings from ServiceM8
            </p>
            <p className="text-sm text-slate-600">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </Card>
        ) : !bookings || bookings.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-600">No bookings found.</p>
            <p className="text-sm text-slate-500 mt-2">
              Make sure your email matches a customer in ServiceM8.
            </p>
          </Card>
        ) : (
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
                          {new Date(
                            booking.scheduledStart
                          ).toLocaleDateString()}
                        </p>
                        <p>
                          {new Date(
                            booking.scheduledStart
                          ).toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
