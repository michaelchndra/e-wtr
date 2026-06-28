export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: 'If that email address is in our database, we will send you an email to reset your password.' }, { status: 200 });
    }

    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date();
    expires_at.setHours(expires_at.getHours() + 1); // 1 hour expiration

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires_at,
      },
    });

    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: 'E-WTR Support <noreply@e-wtr.lunemich.dev>', // Menggunakan domain yang sudah diverifikasi
      to: email,
      subject: 'Reset Your E-WTR Password',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800;">E-WTR</h1>
            <p style="color: #64748b; margin-top: 5px; font-size: 14px;">Project Control Management System</p>
          </div>
          
          <div style="background-color: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;">
            <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 15px;">
              Hello <strong>${user.name}</strong>,<br/><br/>
              We received a request to reset your password for your E-WTR account. If you didn't make this request, you can safely ignore this email.
            </p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${resetUrl}" style="background-color: #0f172a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 15px;">Reset Password</a>
            </div>
            
            <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 0;">
              This link will expire in exactly 1 hour for your security.<br/>
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${resetUrl}" style="color: #0284c7; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 25px;">
            <p style="color: #94a3b8; font-size: 12px;">
              &copy; ${new Date().getFullYear()} E-WTR Portal. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'If an account with that email exists, a reset link has been sent.' }, { status: 200 });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Forgot password error:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
