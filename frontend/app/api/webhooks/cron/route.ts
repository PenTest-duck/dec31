import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { Database } from "@/lib/supabase/database.types";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  // Verify webhook secret
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `bearer ${process.env.WEBHOOK_SECRET}`;

  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Get all users with their settings
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, name, timezone, notification_time, identity_statement")
      .eq("onboarding_completed", true);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ message: "No users to notify" });
    }

    const emailsSent: string[] = [];
    const errors: string[] = [];

    for (const user of users) {
      try {
        // Calculate if it's notification time for this user
        const userTimezone = user.timezone || "America/New_York";
        const notificationTime = user.notification_time || "21:00:00";

        // Parse notification time
        const [notifHour, notifMinute] = notificationTime.split(":").map(Number);

        // Get current time in user's timezone
        const userNow = new Date(now.toLocaleString("en-US", { timeZone: userTimezone }));
        const userHour = userNow.getHours();
        const userMinute = userNow.getMinutes();

        // Check if current time matches notification time (within 30-minute cron window)
        const isNotificationTime =
          userHour === notifHour && userMinute >= notifMinute && userMinute < notifMinute + 30;

        if (!isNotificationTime) {
          continue;
        }

        // Check if user already voted today (in their timezone)
        const userToday = new Date(now.toLocaleString("en-US", { timeZone: userTimezone }))
          .toISOString()
          .split("T")[0];

        const { data: existingVote } = await supabase
          .from("votes")
          .select("id")
          .eq("user_id", user.id)
          .eq("date", userToday)
          .single();

        if (existingVote) {
          continue;
        }

        // Generate secure token for email voting links
        const token = Buffer.from(
          JSON.stringify({ userId: user.id, date: userToday, exp: Date.now() + 24 * 60 * 60 * 1000 })
        ).toString("base64url");

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const closerUrl = `${baseUrl}/api/vote?token=${token}&vote=closer`;
        const furtherUrl = `${baseUrl}/api/vote?token=${token}&vote=further`;

        // Send email
        const { error: emailError } = await resend.emails.send({
          from: "dec31 <noreply@dec31.app>",
          to: user.email,
          subject: "Your daily dec31 check-in",
          html: generateEmailHtml(user.name || "there", closerUrl, furtherUrl),
        });

        if (emailError) {
          errors.push(`Failed to send to ${user.email}: ${emailError.message}`);
        } else {
          emailsSent.push(user.email);
        }
      } catch (err) {
        errors.push(`Error processing user ${user.id}: ${err}`);
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent: emailsSent.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateEmailHtml(name: string, closerUrl: string, furtherUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #000;
      color: #fff;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 480px;
      margin: 0 auto;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 40px;
      letter-spacing: -0.5px;
    }
    .question {
      font-size: 18px;
      color: #a1a1aa;
      margin-bottom: 32px;
      line-height: 1.5;
    }
    .buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
    }
    .btn {
      display: inline-block;
      padding: 16px 32px;
      font-size: 16px;
      font-weight: 500;
      text-decoration: none;
      border-radius: 0;
    }
    .btn-closer {
      background-color: #22c55e;
      color: #000;
    }
    .btn-further {
      background-color: #ef4444;
      color: #fff;
    }
    .footer {
      margin-top: 48px;
      font-size: 12px;
      color: #71717a;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">dec31</div>
    <p class="question">
      Hey ${name},<br><br>
      Did you feel closer or further from your Dec 31 identity today?
    </p>
    <div class="buttons">
      <a href="${closerUrl}" class="btn btn-closer">Closer</a>
      <a href="${furtherUrl}" class="btn btn-further">Further</a>
    </div>
    <p class="footer">
      One click. That's it.<br>
      Every day you vote is a day you're paying attention.
    </p>
  </div>
</body>
</html>
`;
}
