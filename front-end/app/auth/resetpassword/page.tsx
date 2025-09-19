"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/v1/auth/resetpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) throw new Error("Invalid or expired token.");
      setDone(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    }
  }

  if (!token) return <p>Invalid reset link.</p>;

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto mt-12">
      <h2 className="text-xl font-bold mb-4">Reset Password</h2>
      {done ? (
        <p>Password reset! Redirecting to login…</p>
      ) : (
        <>
          <input
            type="password"
            required
            minLength={8}
            className="border px-3 py-2 w-full mb-2"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" className="btn w-full">Set New Password</button>
          {error && <p className="text-red-600">{error}</p>}
        </>
      )}
    </form>
  );
}
