import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '@/lib/env';

function sign(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: '15m' });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, env.JWT_SECRET) as { sub: string };
  } catch {
    return null;
  }
}

export function publicUser(u: any) {
  return { id: u.id, email: u.email, firstName: u.first_name, lastName: u.last_name, createdAt: u.created_at };
}

export async function signup(fname: string, lname: string, email: string, password: string, phone?: string, referralCode?: string) {
  try {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      throw { status: 400, message: 'Email already registered' };
    }
    
    // Phone validation - adding a default value if not provided
    const phoneToUse = phone || '';
    if (!phoneToUse) {
      console.warn('Phone number not provided during signup');
    } else {
      const existingPhone = await prisma.user.findUnique({ where: { phone: phoneToUse } });
      if (existingPhone) {
        throw { status: 400, message: 'Phone number already registered' };
      }
    }
    
    const passwordHash = bcrypt.hashSync(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        first_name: fname,
        last_name: lname,
        password_hash: passwordHash,
        phone: phoneToUse, // Use the default empty string if undefined
        referral_code: referralCode,
      }
    });
    
    // Create a default NGN account with 25,000 starting balance
    try {
      await prisma.account.create({
        data: {
          user_id: user.id,
          balance: 25000,
          currency: 'NGN',
        }
      });
    } catch (e) {
      console.error('Failed to create account for new user:', e);
      // Non-fatal: account can be created later
    }
    
    const token = sign(user.id);
    return { user: publicUser(user), token };
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
}

export async function login(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      throw { status: 401, message: 'Invalid credentials' };
    }
    const token = sign(user.id);
    return { user: publicUser(user), token };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}
