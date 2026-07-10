import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import * as otplib from "otplib";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret-change-me";
const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface SessionUser {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  balance: number;
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// JWT tokens
export function generateToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

// Session management
export async function createSession(
  user: SessionUser,
  type: "user" | "admin" = "user"
) {
  const token = generateToken(user);
  const cookieStore = await cookies();
  const cookieName = type === "admin" ? "admin-session" : "user-session";

  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_EXPIRY / 1000,
    path: "/",
  });

  return token;
}

export async function getSession(
  type: "user" | "admin" = "user"
): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const cookieName = type === "admin" ? "admin-session" : "user-session";
  const token = cookieStore.get(cookieName)?.value;

  if (!token) return null;
  return verifyToken(token);
}

export async function destroySession(type: "user" | "admin" = "user") {
  const cookieStore = await cookies();
  const cookieName = type === "admin" ? "admin-session" : "user-session";
  cookieStore.delete(cookieName);
}

// 2FA (TOTP)
export function generateTwoFactorSecret(): string {
  return otplib.generateSecret();
}

export function generateTwoFactorUri(
  username: string,
  secret: string
): string {
  return otplib.generateURI({
    strategy: "totp",
    secret,
    label: username,
    issuer: "AmarFollower",
  });
}

export async function verifyTwoFactorToken(
  token: string,
  secret: string
): Promise<boolean> {
  const result = await otplib.verify({ token, secret });
  return result.valid;
}

// Authorization helpers
export function isAdmin(user: SessionUser): boolean {
  return user.role === "admin";
}

export function isActive(user: SessionUser): boolean {
  return user.status === "active";
}

// Fetch user from database by credentials
export async function authenticateUser(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const valid = await verifyPassword(password, user.password);
  if (!valid) return null;

  if (user.status !== "active") return null;

  // Check 2FA
  if (user.twoFactorEnabled) {
    return { ...userToSession(user), require2FA: true } as SessionUser;
  }

  return userToSession(user);
}

// Password reset tokens
export function generateResetToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(6).toString("hex");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}

export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function userToSession(user: { id: number; username: string; email: string; role: string; status: string; balance: { toNumber(): number } | number | string }): SessionUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
    balance: Number(user.balance),
  };
}
