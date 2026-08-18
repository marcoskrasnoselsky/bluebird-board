"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F6F3EC" }}>
      <div style={{ width: "100%", maxWidth: 380, background: "#FFFDF8", border: "1px solid #E4DDC9", borderRadius: 14, padding: 32 }}>
        <div style={{ fontSize: 30, marginBottom: 6 }}>🐦</div>
        <h1 className="fraunces" style={{ fontSize: 22, margin: "0 0 4px", fontWeight: 600 }}>
          Create your account
        </h1>
        <p style={{ fontSize: 13, color: "#8A8471", margin: "0 0 24px" }}>
          Anyone with this link can sign up — share it only with your team.
        </p>

        {done ? (
          <div style={{ fontSize: 13, background: "#E4EDE6", color: "#2F5233", padding: "12px 14px", borderRadius: 8, lineHeight: 1.5 }}>
            Check your email to confirm your account, then{" "}
            <Link href="/login" style={{ color: "#2F5233", fontWeight: 600 }}>
              sign in
            </Link>
            .
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="mono" style={{ fontSize: 11, color: "#8A8471" }}>EMAIL</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="you@bluebird.com" />

            <label className="mono" style={{ fontSize: 11, color: "#8A8471", marginTop: 14, display: "block" }}>PASSWORD</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="At least 6 characters"
            />

            {error && (
              <div style={{ marginTop: 14, fontSize: 12, color: "#8A2E2E", background: "#F1DEDD", padding: "8px 12px", borderRadius: 8 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        )}

        <p style={{ fontSize: 12, color: "#8A8471", marginTop: 18, textAlign: "center" }}>
          Already have an account? <Link href="/login" style={{ color: "#2F5233" }}>Sign in</Link>
        </p>
      </div>
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
