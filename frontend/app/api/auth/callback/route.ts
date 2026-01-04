import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getRedirectUrl(origin: string, request: Request, path: string) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  if (isLocalEnv) {
    return `${origin}${path}`;
  } else if (forwardedHost) {
    return `https://${forwardedHost}${path}`;
  } else {
    return `${origin}${path}`;
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if user exists in our users table
        const { data: existingUser } = await supabase
          .from("users")
          .select("id, onboarding_completed")
          .eq("id", user.id)
          .single();

        if (!existingUser) {
          // New user - create record with API key and redirect to onboarding
          const { error: insertError } = await supabase.from("users").insert({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name?.split(" ")[0] || null,
            api_key: Array.from(crypto.getRandomValues(new Uint8Array(32)))
              .map(b => b.toString(16).padStart(2, '0'))
              .join(''),
          });

          if (!insertError) {
            return NextResponse.redirect(
              getRedirectUrl(origin, request, "/onboarding")
            );
          }
        } else if (!existingUser.onboarding_completed) {
          // Existing user but hasn't completed onboarding
          return NextResponse.redirect(
            getRedirectUrl(origin, request, "/onboarding")
          );
        } else {
          // Existing user with completed onboarding
          return NextResponse.redirect(
            getRedirectUrl(origin, request, "/dashboard")
          );
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
