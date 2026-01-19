/**
 * Email Templates Usage Examples
 * 
 * This file demonstrates how to use the email templates with the email API.
 * Copy these examples into your application code where needed.
 */

// Example 1: Integrate welcome email in signup route
// File: app/api/auth/signup/route.ts

/*
import { NextResponse } from 'next/server';
import { welcomeTemplate } from '@/lib/emailTemplates';

export async function POST(req: Request) {
  // ... your signup logic ...
  
  const newUser = await createUser(userData);
  
  // Send welcome email
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: newUser.email,
        subject: 'Welcome to Kalvium!',
        message: welcomeTemplate(newUser.name)
      })
    });
    
    console.log('Welcome email sent to', newUser.email);
  } catch (error) {
    // Log but don't fail the signup if email fails
    console.error('Failed to send welcome email:', error);
  }
  
  return NextResponse.json({ success: true, user: newUser });
}
*/

// Example 2: Password reset email
// File: app/api/auth/forgot-password/route.ts

/*
import { NextResponse } from 'next/server';
import { passwordResetTemplate } from '@/lib/emailTemplates';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { email } = await req.json();
  
  // Find user and generate reset token
  const user = await findUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  // Generate secure token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiryTime = Date.now() + 3600000; // 1 hour
  
  // Save token to database
  await saveResetToken(user.id, resetToken, expiryTime);
  
  // Send reset email
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: user.email,
        subject: 'Reset Your Password',
        message: passwordResetTemplate(user.name, resetToken, 60)
      })
    });
    
    return NextResponse.json({ success: true, message: 'Reset email sent' });
  } catch (error) {
    console.error('Failed to send reset email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
*/

// Example 3: Email verification after signup
// File: app/api/auth/verify-email/route.ts

/*
import { NextResponse } from 'next/server';
import { emailVerificationTemplate } from '@/lib/emailTemplates';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { userId } = await req.json();
  
  const user = await findUserById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  await saveVerificationToken(user.id, verificationToken);
  
  // Send verification email
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: user.email,
        subject: 'Verify Your Email Address',
        message: emailVerificationTemplate(user.name, verificationToken)
      })
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
*/

// Example 4: Payment confirmation email
// File: app/api/payments/confirm/route.ts

/*
import { NextResponse } from 'next/server';
import { paymentConfirmationTemplate } from '@/lib/emailTemplates';

export async function POST(req: Request) {
  const { userId, paymentData } = await req.json();
  
  const user = await findUserById(userId);
  const invoice = await createInvoice(paymentData);
  
  // Send payment confirmation
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: user.email,
        subject: 'Payment Confirmation - Invoice #' + invoice.id,
        message: paymentConfirmationTemplate(
          user.name,
          paymentData.amount,
          paymentData.currency,
          invoice.id,
          paymentData.planName
        )
      })
    });
    
    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error('Failed to send payment confirmation:', error);
    // Payment succeeded, just log the email failure
    return NextResponse.json({ success: true, invoice, emailError: true });
  }
}
*/

// Example 5: Security alert email
// File: app/api/security/alert/route.ts

/*
import { NextResponse } from 'next/server';
import { accountAlertTemplate } from '@/lib/emailTemplates';

export async function POST(req: Request) {
  const { userId, alertType, alertMessage } = await req.json();
  
  const user = await findUserById(userId);
  
  // Send security alert
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: user.email,
        subject: `Security Alert: ${alertType}`,
        message: accountAlertTemplate(user.name, alertType, alertMessage)
      })
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send security alert:', error);
    return NextResponse.json({ error: 'Failed to send alert' }, { status: 500 });
  }
}
*/

// Example 6: Activity notification
// File: app/api/notifications/send/route.ts

/*
import { NextResponse } from 'next/server';
import { activityNotificationTemplate } from '@/lib/emailTemplates';

export async function POST(req: Request) {
  const { userId, activityType, activityDetails, actionUrl } = await req.json();
  
  const user = await findUserById(userId);
  
  // Check if user has email notifications enabled
  if (!user.preferences.emailNotifications) {
    return NextResponse.json({ success: true, skipped: true });
  }
  
  // Send activity notification
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: user.email,
        subject: `Activity Update: ${activityType}`,
        message: activityNotificationTemplate(
          user.name,
          activityType,
          activityDetails,
          actionUrl
        )
      })
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send activity notification:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
*/

// Best Practices:
// 1. Always use try-catch when sending emails
// 2. Don't fail the main operation if email sending fails
// 3. Log email failures for debugging
// 4. Consider queuing emails for high-volume scenarios
// 5. Respect user notification preferences
// 6. Use environment variables for the base URL

export {};
