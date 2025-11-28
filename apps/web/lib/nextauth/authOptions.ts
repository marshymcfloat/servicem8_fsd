import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authLoginSchema } from "@repo/validators";
import { apiClient } from "@/lib/api/client";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email_or_phone: { label: "Email or Phone Number", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.password) {
          throw new Error("Password is required");
        }

        const email_or_phone = credentials.email_or_phone;
        const password = credentials.password;

        if (!email_or_phone) {
          throw new Error("Email or phone number is required");
        }

        const isEmailInput = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_or_phone);
        const email = isEmailInput ? email_or_phone : undefined;
        const phone_number = !isEmailInput ? email_or_phone : undefined;

        const validationResult = authLoginSchema.safeParse({
          email_or_phone,
          password,
        });

        if (!validationResult.success) {
          throw new Error("Invalid credentials format");
        }

        // Debug: Log the API URL being used
        const apiUrl =
          process.env.API_URL ||
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:3001";
        console.log("Auth: Using API URL:", apiUrl);
        console.log(
          "Auth: Attempting to verify credentials for:",
          email || phone_number
        );

        let result;
        try {
          result = await apiClient.verifyCredentials(
            email,
            phone_number,
            password
          );
          console.log("Auth: API response received:", {
            success: result.success,
            hasUser: !!result.user,
          });
        } catch (error) {
          console.error("Auth: API call failed:", error);
          console.error("Auth: Error details:", {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
          throw new Error(
            "Unable to connect to authentication server. Please try again later."
          );
        }

        if (!result.success || !result.user) {
          console.log("Auth: Invalid credentials provided");
          throw new Error("Invalid credentials");
        }

        const user = result.user;

        return {
          id: user.id,
          email: user.email,
          name: user.username,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};
