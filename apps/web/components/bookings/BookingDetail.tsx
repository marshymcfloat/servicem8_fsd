import { Suspense } from "react";
import { getServerBookingById, getServerMessages } from "@/lib/api/server";
import { Card } from "@/components/ui/card";
import { BookingDetailSkeleton } from "./BookingDetailSkeleton";
import { MessagesSection } from "./MessagesSection";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function BookingData({ bookingId }: { bookingId: string }) {
  const booking = await getServerBookingById(bookingId);

  if (!booking) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-600">Booking not found.</p>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4">
          {booking.booking.description ||
            booking.summary.jobNumber ||
            "Booking Details"}
        </h1>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-600">Job Number</p>
            <p className="font-semibold">
              {booking.summary.jobNumber || booking.booking.jobNumber || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-slate-600">Status</p>
            <p className="font-semibold">
              {booking.summary.status || booking.booking.status || "Unknown"}
            </p>
          </div>
          {booking.summary.startTime && (
            <div>
              <p className="text-slate-600">Start Time</p>
              <p className="font-semibold">
                {new Date(booking.summary.startTime).toLocaleString()}
              </p>
            </div>
          )}
          {booking.summary.endTime && (
            <div>
              <p className="text-slate-600">End Time</p>
              <p className="font-semibold">
                {new Date(booking.summary.endTime).toLocaleString()}
              </p>
            </div>
          )}
          {booking.customer && (
            <div>
              <p className="text-slate-600">Customer</p>
              <p className="font-semibold">{booking.customer.name}</p>
              {booking.customer.email && (
                <p className="text-xs text-slate-500">
                  {booking.customer.email}
                </p>
              )}
              {(booking.customer.phone || booking.customer.mobile) && (
                <p className="text-xs text-slate-500">
                  {booking.customer.phone || booking.customer.mobile}
                </p>
              )}
            </div>
          )}
          {booking.job &&
            (booking.job.addressStreet || booking.job.addressCity) && (
              <div className="col-span-2">
                <p className="text-slate-600">Address</p>
                <p className="font-semibold">
                  {booking.job.addressStreet}
                  {booking.job.addressCity && `, ${booking.job.addressCity}`}
                  {booking.job.addressState && `, ${booking.job.addressState}`}
                </p>
              </div>
            )}
          {booking.booking.notes && (
            <div className="col-span-2">
              <p className="text-slate-600">Notes</p>
              <p className="font-semibold">{booking.booking.notes}</p>
            </div>
          )}
          {booking.booking.description && (
            <div className="col-span-2">
              <p className="text-slate-600">Description</p>
              <p className="font-semibold">{booking.booking.description}</p>
            </div>
          )}
        </div>
      </Card>

      {booking?.attachments && booking.attachments.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Attachments</h2>
          <div className="grid grid-cols-3 gap-4">
            {booking.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={`${API_URL}/attachments/${
                  booking.job?.uuid || booking.booking.id
                }/${attachment.id}/metadata`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 border rounded hover:bg-slate-100 transition cursor-pointer"
              >
                <p className="text-sm font-medium truncate">
                  {attachment.filename}
                </p>
              </a>
            ))}
          </div>
        </Card>
      )}

      <MessagesSection bookingId={bookingId} />
    </>
  );
}

export function BookingDetail({ bookingId }: { bookingId: string }) {
  return (
    <Suspense fallback={<BookingDetailSkeleton />}>
      <BookingData bookingId={bookingId} />
    </Suspense>
  );
}
