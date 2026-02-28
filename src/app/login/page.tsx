"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ArrowRight, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const supabase = createClient();

    // Check if email is on the allowlist
    const { data: allowed } = await supabase
      .from("allowed_emails")
      .select("email")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (!allowed) {
      setStatus("error");
      setErrorMsg("This email isn't on the invite list. Ask Evan for access.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/[0.04] blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-primary/[0.06] blur-3xl" />
      </div>

      <div className="w-full max-w-sm space-y-10 relative z-10">
        {/* Logo + tagline */}
        <div className="text-center animate-fade-up">
          <Logo size="lg" showTagline />
        </div>

        {status === "sent" ? (
          <div
            className="rounded-xl border bg-card p-8 text-center space-y-4 shadow-sm animate-fade-up"
            style={{ animationDelay: "100ms" }}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-lg font-serif">Check your email</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We sent a magic link to <strong className="text-foreground">{email}</strong>.
                <br />Click it to sign in.
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 animate-fade-up"
            style={{ animationDelay: "100ms" }}
          >
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="w-full h-12 rounded-xl border bg-card px-4 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/40 focus:shadow-lg focus:shadow-primary/5"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-destructive bg-destructive/5 rounded-lg px-3 py-2">
                {errorMsg}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-sm font-semibold tracking-wide transition-all hover:shadow-lg hover:shadow-primary/20"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                "Sending..."
              ) : (
                <>
                  Send magic link
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Invite-only. Enter your email to receive a sign-in link.
            </p>
          </form>
        )}
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-12 h-0.5 rounded-full bg-primary/20" />
      </div>
    </div>
  );
}
