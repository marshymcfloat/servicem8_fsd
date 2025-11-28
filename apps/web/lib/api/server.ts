import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth/authOptions";
import type { Booking, BookingDetails, Message } from "./client";

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

async function serverRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store", // Always fetch fresh data
  });

  if (!response.ok) {
    let errorMessage = response.statusText || "API request failed";
    try {
      const error = await response.json();
      if (error.message) {
        errorMessage = Array.isArray(error.message)
          ? error.message.join(", ")
          : error.message;
      } else if (error.error) {
        errorMessage = error.error;
      }
    } catch {}
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getServerBookings(): Promise<Booking[]> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return [];
  }

  const params = new URLSearchParams();
  params.append("email", session.user.email);
  
  return serverRequest<Booking[]>(`/bookings?${params.toString()}`);
}

export async function getServerBookingById(id: string): Promise<BookingDetails | null> {
  try {
    return await serverRequest<BookingDetails>(`/bookings/${id}`);
  } catch {
    return null;
  }
}

export async function getServerMessages(bookingId: string): Promise<Message[]> {
  try {
    return await serverRequest<Message[]>(`/messages/booking/${bookingId}`);
  } catch {
    return [];
  }
}

export async function getServerSessionUser() {
  return await getServerSession(authOptions);
}

