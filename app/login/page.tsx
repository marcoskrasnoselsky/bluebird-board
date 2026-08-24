"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { SIGNUP_EMAIL_DOMAIN } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message);
      return;
    }
    router.replace("/board");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F6F3EC" }}>
      <form
        onSubmit={handleSubmit}
        style={{ width: "100%", maxWidth: 380, background: "#FFFDF8", border: "1px solid #E4DDC9", borderRadius: 14, padding: 32 }}
      >
        <Image src="/bluebird-logo.png" alt="Bluebird" width={150} height={29} style={{ marginBottom: 14 }} priority />
        <h1 className="fraunces" style={{ fontSize: 22, margin: "0 0 4px", fontWeight: 600 }}>
          Prospect Board
        </h1>
        <p style={{ fontSize: 13, color: "#6B6656", margin: "0 0 24px" }}>Sign in to your team account.</p>

        <label className="mono" style={{ fontSize: 11, color: "#6B6656" }}>EMAIL</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          placeholder={`you@${SIGNUP_EMAIL_DOMAIN}`}
        />

        <label className="mono" style={{ fontSize: 11, color: "#6B6656", marginTop: 14, display: "block" }}>PASSWORD</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          placeholder="••••••••"
        />

        {error && (
          <div style={{ marginTop: 14, fontSize: 12, color: "#8A2E2E", background: "#F1DEDD", padding: "8px 12px", borderRadius: 8 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p style={{ fontSize: 12, color: "#6B6656", marginTop: 18, textAlign: "center" }}>
          No account yet? <Link href="/signup" style={{ color: "#2F5233" }}>Create one</Link>
        </p>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 6,
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #DCD5C3",
  background: "#FFFDF8",
  fontSize: 14,
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 20,
  padding: "11px 0",
  borderRadius: 8,
  border: "none",
  background: "#232323",
  color: "#F6F3EC",
  fontSize: 14,
  fontWeight: 600,
};
