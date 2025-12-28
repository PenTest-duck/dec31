import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/database.types";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");
  const vote = searchParams.get("vote");

  if (!token || !vote) {
    return redirectWithMessage("error", "Missing token or vote");
  }

  if (vote !== "closer" && vote !== "further") {
    return redirectWithMessage("error", "Invalid vote");
  }

  try {
    // Decode token
    const decoded = JSON.parse(Buffer.from(token, "base64url").toString());
    const { userId, date, exp } = decoded;

    // Check expiration
    if (Date.now() > exp) {
      return redirectWithMessage("expired", "This link has expired");
    }

    // Check if vote already exists
    const { data: existingVote } = await supabase
      .from("votes")
      .select("id, vote")
      .eq("user_id", userId)
      .eq("date", date)
      .single();

    if (existingVote) {
      return redirectWithMessage("already_voted", `You already voted "${existingVote.vote}" for ${date}`);
    }

    // Insert vote
    const { error } = await supabase.from("votes").insert({
      user_id: userId,
      date,
      vote,
    });

    if (error) {
      console.error("Error inserting vote:", error);
      return redirectWithMessage("error", "Failed to record vote");
    }

    return redirectWithMessage("success", vote);
  } catch (error) {
    console.error("Vote error:", error);
    return redirectWithMessage("error", "Invalid token");
  }
}

function redirectWithMessage(status: string, message: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.redirect(`${baseUrl}/vote-result?status=${status}&message=${encodeURIComponent(message)}`);
}
