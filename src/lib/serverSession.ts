import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, serverDb } from './serverDb';
import { User } from './types';

export async function getAuthenticatedUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const userId = serverDb.verifySessionToken(token);
  if (!userId) return null;
  return serverDb.getUserById(userId);
}

export function attachSessionCookie(res: NextResponse, userId: string, request?: Request): void {
  const token = serverDb.signSessionToken(userId);
  const proto =
    request?.headers.get('x-forwarded-proto') ||
    (request ? new URL(request.url).protocol.replace(':', '') : 'http');

  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: proto === 'https',
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
}
