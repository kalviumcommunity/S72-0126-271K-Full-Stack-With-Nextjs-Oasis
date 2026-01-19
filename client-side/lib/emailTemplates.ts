/**
 * Email Templates for Transactional Emails
 * 
 * This file contains reusable HTML email templates for various user interactions.
 * All templates follow a consistent design and include proper HTML structure.
 */

// Base email wrapper with consistent styling
const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kalvium Notification</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 12px;
      border-top: 1px solid #e9ecef;
    }
    hr {
      border: none;
      border-top: 1px solid #e9ecef;
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
</body>
</html>
`;

/**
 * Welcome Email Template
 * Sent when a new user signs up
 */
export const welcomeTemplate = (userName: string) => emailWrapper(`
  <div class="header">
    <h1>🎉 Welcome to Kalvium!</h1>
  </div>
  <div class="content">
    <h2>Hello ${userName},</h2>
    <p>We're thrilled to have you onboard! Your journey to mastering full-stack development starts here.</p>
    <p>Here's what you can do next:</p>
    <ul>
      <li>Explore your personalized dashboard</li>
      <li>Complete your profile setup</li>
      <li>Join our community of learners</li>
      <li>Start your first lesson</li>
    </ul>
    <a href="https://app.kalvium.community" class="button">Get Started</a>
    <hr/>
    <p><strong>Need help?</strong> Our support team is always here to assist you.</p>
  </div>
  <div class="footer">
    <p>This is an automated email. Please do not reply to this message.</p>
    <p>&copy; ${new Date().getFullYear()} Kalvium. All rights reserved.</p>
  </div>
`);

/**
 * Password Reset Email Template
 * Sent when a user requests a password reset
 */
export const passwordResetTemplate = (userName: string, resetToken: string, expiryMinutes: number = 60) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.kalvium.community'}/reset-password?token=${resetToken}`;
  
  return emailWrapper(`
    <div class="header">
      <h1>🔐 Password Reset Request</h1>
    </div>
    <div class="content">
      <h2>Hello ${userName},</h2>
      <p>We received a request to reset your password for your Kalvium account.</p>
      <p>Click the button below to reset your password. This link will expire in <strong>${expiryMinutes} minutes</strong>.</p>
      <a href="${resetUrl}" class="button">Reset Password</a>
      <hr/>
      <p><strong>Didn't request this?</strong> You can safely ignore this email. Your password will not be changed.</p>
      <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:<br/>
      <code style="background: #f4f4f4; padding: 5px 10px; border-radius: 3px; display: inline-block; margin-top: 10px;">${resetUrl}</code></p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
      <p>&copy; ${new Date().getFullYear()} Kalvium. All rights reserved.</p>
    </div>
  `);
};

/**
 * Account Alert Email Template
 * Sent for security notifications or important account changes
 */
export const accountAlertTemplate = (userName: string, alertType: string, alertMessage: string) => emailWrapper(`
  <div class="header">
    <h1>⚠️ Account Security Alert</h1>
  </div>
  <div class="content">
    <h2>Hello ${userName},</h2>
    <p><strong>Alert Type:</strong> ${alertType}</p>
    <p>${alertMessage}</p>
    <p>If you recognize this activity, you can safely ignore this email. If you don't recognize this activity, please secure your account immediately.</p>
    <a href="https://app.kalvium.community/settings/security" class="button">Review Security Settings</a>
    <hr/>
    <p><strong>Security Tips:</strong></p>
    <ul>
      <li>Use a strong, unique password</li>
      <li>Enable two-factor authentication</li>
      <li>Never share your credentials</li>
      <li>Keep your recovery email updated</li>
    </ul>
  </div>
  <div class="footer">
    <p>This is an automated email. Please do not reply to this message.</p>
    <p>&copy; ${new Date().getFullYear()} Kalvium. All rights reserved.</p>
  </div>
`);

/**
 * Payment Confirmation Email Template
 * Sent after a successful payment transaction
 */
export const paymentConfirmationTemplate = (
  userName: string,
  amount: number,
  currency: string,
  invoiceId: string,
  planName: string
) => emailWrapper(`
  <div class="header">
    <h1>✅ Payment Confirmed</h1>
  </div>
  <div class="content">
    <h2>Thank you, ${userName}!</h2>
    <p>Your payment has been successfully processed. Here are your transaction details:</p>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Plan:</strong> ${planName}</p>
      <p style="margin: 5px 0;"><strong>Amount:</strong> ${currency} ${amount.toFixed(2)}</p>
      <p style="margin: 5px 0;"><strong>Invoice ID:</strong> ${invoiceId}</p>
      <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</p>
    </div>
    <a href="https://app.kalvium.community/invoices/${invoiceId}" class="button">View Invoice</a>
    <hr/>
    <p>Questions about your payment? Contact our billing support team.</p>
  </div>
  <div class="footer">
    <p>This is an automated email. Please do not reply to this message.</p>
    <p>&copy; ${new Date().getFullYear()} Kalvium. All rights reserved.</p>
  </div>
`);

/**
 * Activity Notification Email Template
 * Sent for important user activity notifications
 */
export const activityNotificationTemplate = (
  userName: string,
  activityType: string,
  activityDetails: string,
  actionUrl?: string
) => emailWrapper(`
  <div class="header">
    <h1>📢 New Activity</h1>
  </div>
  <div class="content">
    <h2>Hello ${userName},</h2>
    <p><strong>${activityType}</strong></p>
    <p>${activityDetails}</p>
    ${actionUrl ? `<a href="${actionUrl}" class="button">View Details</a>` : ''}
    <hr/>
    <p>Stay updated with your account activity through your dashboard.</p>
  </div>
  <div class="footer">
    <p>This is an automated email. Please do not reply to this message.</p>
    <p>To manage your notification preferences, visit your <a href="https://app.kalvium.community/settings/notifications">account settings</a>.</p>
    <p>&copy; ${new Date().getFullYear()} Kalvium. All rights reserved.</p>
  </div>
`);

/**
 * Email Verification Template
 * Sent to verify a user's email address
 */
export const emailVerificationTemplate = (userName: string, verificationToken: string) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.kalvium.community'}/verify-email?token=${verificationToken}`;
  
  return emailWrapper(`
    <div class="header">
      <h1>📧 Verify Your Email</h1>
    </div>
    <div class="content">
      <h2>Hello ${userName},</h2>
      <p>Please verify your email address to activate your Kalvium account and get full access to all features.</p>
      <a href="${verificationUrl}" class="button">Verify Email Address</a>
      <hr/>
      <p>This verification link will expire in 24 hours.</p>
      <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:<br/>
      <code style="background: #f4f4f4; padding: 5px 10px; border-radius: 3px; display: inline-block; margin-top: 10px;">${verificationUrl}</code></p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
      <p>&copy; ${new Date().getFullYear()} Kalvium. All rights reserved.</p>
    </div>
  `);
};
