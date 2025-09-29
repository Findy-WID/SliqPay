import { lucia } from "lucia";
import { nextjs_future } from "lucia/middleware";
import { prisma as prismaAdapter } from "@lucia-auth/adapter-prisma";
import { db } from "@/lib/prisma";
import { cache } from "react";
import * as context from "next/headers";

export const auth = lucia({
  adapter: prismaAdapter(db),
  env: process.env.NODE_ENV === "production" ? "PROD" : "DEV",
  middleware: nextjs_future(),
  sessionCookie: {
    expires: false,
  },

  getUserAttributes: (data) => {
    return {
      id: data.id,
      email: data.email,
      fname: data.fname,
      lname: data.lname,
      phone: data.phone,
      emailVerified: data.emailVerified,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
});

export type Auth = typeof auth;

export const getPageSession = cache(() => {
  const authRequest = auth.handleRequest("GET", context);
  return authRequest.validate();
});
