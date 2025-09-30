import { lucia } from "lucia";
import { nextjs_future } from "lucia/middleware";
import { prisma as prismaAdapter } from "@lucia-auth/adapter-prisma";
import { prisma } from "@/lib/prisma";
import { cache } from "react";
import * as context from "next/headers";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '@/lib/env';

export const auth = lucia({
  adapter: prismaAdapter(prisma),
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

function sign(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: '15m' });
}

export function publicUser(u: any) {
  return { id: u.id, email: u.email, firstName: u.first_name, lastName: u.last_name, createdAt: u.created_at };
}

export async function signup(fname: string, lname: string, email: string, password: string, phone?: string, referralCode?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw { status: 400, message: 'Email already registered' };
  }
  if (!phone) {
    throw { status: 400, message: 'Phone number is required' };
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      first_name: fname,
      last_name: lname,
      password_hash: passwordHash,
      phone,
      referral_code: referralCode,
    }
  });
  const token = sign(user.id);
  return { user: publicUser(user), token };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    throw { status: 401, message: 'Invalid credentials' };
  }
  const token = sign(user.id);
  return { user: publicUser(user), token };
}
