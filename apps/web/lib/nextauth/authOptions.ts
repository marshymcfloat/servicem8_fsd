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

        const result = await apiClient.verifyCredentials(
          email,
          phone_number,
          password
        );

        if (!result.success || !result.user) {
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
