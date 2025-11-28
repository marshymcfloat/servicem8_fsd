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
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.message || "API request failed");
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
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: User; message?: string }> {
    return this.request("/user/verify-credentials", {
      method: "POST",
      body: JSON.stringify({ email, password }),
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
}

export const apiClient = new ApiClient(API_URL);
