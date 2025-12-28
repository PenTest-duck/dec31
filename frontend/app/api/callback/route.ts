import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/lib/supabase/server";

// Helper function to generate redirect URL
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

  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    // if "next" is not a relative URL, use the default
    next = "/";
  }

  if (code) {
    const supabase = await createClient();
    const { data: resp, error } = await supabase.auth.exchangeCodeForSession(
      code
    );
    if (!error) {
      // TODO: if new signup, handle it here

      // Default redirect (no form data or project creation failed)
      return NextResponse.redirect(getRedirectUrl(origin, request, next));
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
