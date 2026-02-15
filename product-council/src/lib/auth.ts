import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getRedis, checkRateLimit } from './redis';
import crypto from 'crypto';

// Since we don't have a DB adapter, we implement a custom email-based
// auth flow: user submits email → we send magic link → user clicks it
// → we verify the token → issue JWT session.

// We use the Credentials provider as a workaround for adapter-less NextAuth v5
// + a separate /api/auth/send route to send links and /verify page to verify them.

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      id: 'magic-link',
      name: 'Magic Link',
      credentials: {
        email: { label: 'Email', type: 'email' },
        token: { label: 'Token', type: 'text' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const token = credentials?.token as string;

        if (!email || !token) return null;

        // Verify token from Redis
        const r = getRedis();
        const storedEmail = await r.get(`magic:${token}`);

        if (!storedEmail || storedEmail !== email) {
          return null;
        }

        // Token is valid — delete it (one-time use)
        await r.del(`magic:${token}`);

        // Upsert user in Redis
        const userKey = `user:${email}`;
        const exists = await r.exists(userKey);
        if (!exists) {
          await r.hset(userKey, 'createdAt', new Date().toISOString());
        }
        await r.hset(userKey, 'lastLogin', new Date().toISOString());

        return { id: email, email, name: email.split('@')[0] };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.email) {
        session.user = {
          ...session.user,
          email: token.email as string,
          name: token.name as string,
        };
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-change-me',
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// --- Helper functions for the magic link flow ---

export async function sendMagicLink(email: string): Promise<{ ok: boolean; error?: string }> {
  // Rate limit: 3 attempts per email per 5 minutes
  const allowed = await checkRateLimit(`magic:${email}`, 3, 300);
  if (!allowed) {
    return { ok: false, error: 'Too many attempts. Please wait a few minutes.' };
  }

  // Generate token
  const token = crypto.randomBytes(32).toString('hex');

  // Store in Redis with 10-min TTL
  const r = getRedis();
  await r.set(`magic:${token}`, email, { ex: 600 });

  // Build callback URL
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const callbackUrl = `${baseUrl}/verify?token=${token}&email=${encodeURIComponent(email)}`;

  // Send email via Resend
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    // Dev mode: log to console
    console.log(`\n✉️  Magic link for ${email}:\n${callbackUrl}\n`);
    return { ok: true };
  }

  const fromEmail = process.env.EMAIL_FROM || 'Product Council <onboarding@resend.dev>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: email,
      subject: 'Sign in to Product Council',
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <h2 style="color: #4263eb; margin-bottom: 8px;">Product Council</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Click below to sign in. This link expires in 10 minutes.</p>
          <a href="${callbackUrl}"
             style="display: inline-block; background: #4263eb; color: white; padding: 14px 28px;
                    border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0;">
            Sign In to Product Council
          </a>
          <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Resend error:', err);
    return { ok: false, error: 'Failed to send email. Please try again.' };
  }

  return { ok: true };
}
