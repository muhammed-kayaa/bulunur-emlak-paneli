"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // âœ… COOKIE TARAYICIYA YAZILSIN
      body: JSON.stringify({ email }),
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      setErr(data?.error ?? "LOGIN_FAILED");
      return;
    }

    // role'a gÃ¶re yÃ¶nlendir
    if (data.role === "ADMIN") router.replace("/admin/dashboard");
    else router.replace("/consultant/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">GiriÅŸ</h1>

        <input
          className="w-full border rounded px-3 py-2"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="w-full rounded bg-black text-white py-2">
          GiriÅŸ Yap
        </button>

        {err && <p className="text-sm text-red-600">{err}</p>}
      </form>
    </div>
  );
}