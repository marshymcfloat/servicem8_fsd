const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  phone_numer: string;
  createdAt: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
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

  async createUser(data: {
    email: string;
    username: string;
    phone_numer: string;
    password: string;
  }): Promise<User> {
    return this.request<User>("/user/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async verifyCredentials(
    email?: string,
    phone_number?: string,
    password: string = ""
  ): Promise<{ success: boolean; user?: User; message?: string }> {
    return this.request("/user/verify-credentials", {
      method: "POST",
      body: JSON.stringify({ email, phone_number, password }),
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return this.request<User>(`/user/email/${encodeURIComponent(email)}`);
    } catch {
      return null;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      return this.request<User>(`/user/${id}`);
    } catch {
      return null;
    }
  }

  async getBookings(email?: string, phone?: string): Promise<Booking[]> {
    const params = new URLSearchParams();
    if (email) params.append("email", email);
    if (phone) params.append("phone", phone);
    return this.request<Booking[]>(`/bookings?${params.toString()}`);
  }

  async getBookingById(id: string): Promise<BookingDetails | null> {
    try {
      return this.request<BookingDetails>(`/bookings/${id}`);
    } catch {
      return null;
    }
  }

  async getBookingAttachments(bookingId: string): Promise<Attachment[]> {
    try {
      return this.request<Attachment[]>(`/bookings/${bookingId}/attachments`);
    } catch {
      return [];
    }
  }

  async getMessagesByBooking(bookingId: string): Promise<Message[]> {
    try {
      return this.request<Message[]>(`/messages/booking/${bookingId}`);
    } catch {
      return [];
    }
  }

  async createMessage(
    bookingId: string,
    userId: string,
    content: string
  ): Promise<Message> {
    return this.request<Message>("/messages", {
      method: "POST",
      body: JSON.stringify({ bookingId, userId, content }),
    });
  }
}

export interface Booking {
  id: string;
  jobNumber: string;
  title: string;
  status: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  address?: string;
  city?: string;
  state?: string;
  createdAt: string;
  notes?: string;
  priority?: string;
}

export interface BookingDetails {
  booking: {
    id: string;
    type: string;
    startTime?: string;
    endTime?: string;
    notes?: string;
    status?: string;
    jobNumber?: string;
    jobStatus?: string;
    description?: string;
  };
  job: {
    uuid: string;
    jobNumber: string;
    status: string;
    description?: string;
    addressStreet?: string;
    addressCity?: string;
    addressState?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
  } | null;
  customer: {
    uuid: string;
    name: string;
    email?: string;
    phone?: string;
    mobile?: string;
    address?: string;
  } | null;
  attachments: Attachment[];
  summary: {
    bookingId: string;
    jobId?: string;
    jobNumber: string;
    status: string;
    customerName: string;
    startTime?: string;
    endTime?: string;
    attachmentCount: number;
  };
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  createdAt: string;
}

export interface Message {
  id: string;
  bookingId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export const apiClient = new ApiClient(API_URL);
