"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabasePublic } from "@/lib/supabase";

// Handles the redirect back from Supabase OAuth (e.g. Google Sign-In).
// For PKCE flow: exchanges the code param for a session.
// For implicit flow: the Supabase library auto-handles the hash tokens.
// Either way, onAuthStateChange in AuthProvider will fire SIGNED_IN,
// and we redirect once we know the outcome.
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        const { error } = await supabasePublic.auth.exchangeCodeForSession(code);
        if (error) {
          router.replace("/login?error=auth_failed");
          return;
        }
      }

      const { data } = await supabasePublic.auth.getSession();
      router.replace(data.session ? "/personalized-dashboard" : "/login");
    }

    handleCallback();
  }, [router]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <p>Completing sign in…</p>
    </div>
  );
}
