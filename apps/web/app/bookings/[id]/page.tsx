"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function BookingDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  const queryClient = useQueryClient();
  const [messageContent, setMessageContent] = useState("");

  const { data: booking, isLoading: bookingLoading } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => apiClient.getBookingById(bookingId),
    enabled: !!bookingId && status === "authenticated",
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", bookingId],
    queryFn: () => apiClient.getMessagesByBooking(bookingId),
    enabled: !!bookingId && status === "authenticated",
  });

  // Attachments are now included in booking details

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      apiClient.createMessage(
        bookingId,
        session?.user?.id || "",
        content
      ),
    onSuccess: () => {
      setMessageContent("");
      queryClient.invalidateQueries({ queryKey: ["messages", bookingId] });
    },
  });

  if (status === "loading" || bookingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Booking not found.</p>
      </div>
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageContent.trim()) {
      sendMessageMutation.mutate(messageContent);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button variant="ghost" onClick={() => router.push("/bookings")}>
              ← Back to Bookings
            </Button>
          </div>
          <Button onClick={() => router.push("/api/auth/signout")}>
            Sign Out
          </Button>
        </div>

        <Card className="p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">
            {booking.booking.description || booking.summary.jobNumber || "Booking Details"}
          </h1>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Job Number</p>
              <p className="font-semibold">{booking.summary.jobNumber || booking.booking.jobNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-600">Status</p>
              <p className="font-semibold">{booking.summary.status || booking.booking.status || 'Unknown'}</p>
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
                  <p className="text-xs text-slate-500">{booking.customer.email}</p>
                )}
                {(booking.customer.phone || booking.customer.mobile) && (
                  <p className="text-xs text-slate-500">
                    {booking.customer.phone || booking.customer.mobile}
                  </p>
                )}
              </div>
            )}
            {booking.job && (booking.job.addressStreet || booking.job.addressCity) && (
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

        {/* Attachments */}
        {booking?.attachments && booking.attachments.length > 0 ? (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Attachments</h2>
            <div className="grid grid-cols-3 gap-4">
              {booking.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={`${API_URL}/attachments/${booking.job?.uuid || bookingId}/${attachment.id}/metadata`}
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
        ) : null}

        {/* Messages */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Messages</h2>
          
          {messagesLoading ? (
            <p>Loading messages...</p>
          ) : messages && messages.length > 0 ? (
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded ${
                    message.userId === session?.user?.id
                      ? "bg-blue-100 ml-auto w-3/4"
                      : "bg-slate-100 mr-auto w-3/4"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 mb-6">No messages yet.</p>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={sendMessageMutation.isPending || !messageContent.trim()}
            >
              Send
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}


