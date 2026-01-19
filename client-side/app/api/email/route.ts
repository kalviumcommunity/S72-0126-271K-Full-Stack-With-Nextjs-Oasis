import { NextResponse } from "next/server";
import sendgrid from "@sendgrid/mail";

// Initialize SendGrid with API key
sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

/**
 * POST /api/email
 * Sends a transactional email using SendGrid
 * 
 * Request body:
 * - to: recipient email address
 * - subject: email subject line
 * - message: HTML content of the email
 * 
 * @returns Success status and email details
 */
export async function POST(req: Request) {
  try {
    const { to, subject, message } = await req.json();

    // Validate required fields
    if (!to || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: to, subject, or message" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address format" },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_SENDER) {
      console.error("Missing SendGrid configuration");
      return NextResponse.json(
        { success: false, error: "Email service not configured" },
        { status: 500 }
      );
    }

    const emailData = {
      to,
      from: process.env.SENDGRID_SENDER!,
      subject,
      html: message,
    };

    // Send email via SendGrid
    const response = await sendgrid.send(emailData);
    
    console.log("✅ Email sent successfully:", {
      to,
      subject,
      statusCode: response[0].statusCode,
      messageId: response[0].headers['x-message-id'],
    });

    return NextResponse.json({
      success: true,
      messageId: response[0].headers['x-message-id'],
      statusCode: response[0].statusCode,
    });
  } catch (error: any) {
    console.error("❌ Email send failed:", error);

    // Handle SendGrid-specific errors
    if (error.response) {
      console.error("SendGrid Error Response:", error.response.body);
      return NextResponse.json(
        {
          success: false,
          error: error.response.body.errors?.[0]?.message || "Failed to send email",
        },
        { status: error.code || 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
