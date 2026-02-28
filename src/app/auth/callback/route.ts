import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as "email" | "magiclink" | null;
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();

  // Handle code-based flow (PKCE)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login`);
    }
  }
  // Handle token_hash flow (magic link)
  else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (error) {
      return NextResponse.redirect(`${origin}/login`);
    }
  } else {
    return NextResponse.redirect(`${origin}/login`);
  }

  // Server-side allowlist check — sign out if email not invited
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    const { data: allowed } = await supabase
      .from("allowed_emails")
      .select("email")
      .eq("email", user.email.toLowerCase())
      .single();

    if (!allowed) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/login`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
