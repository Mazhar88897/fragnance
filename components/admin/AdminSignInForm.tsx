"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PasswordField from "@/components/auth/PasswordField";
import type { PublicUser } from "@/lib/auth-types";
import { isAdminSignedIn, setAdminSession } from "@/lib/admin-session";

export default function AdminSignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdminSignedIn()) router.replace("/admin/home");
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/admin-signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        message?: string;
        token?: string;
        user?: PublicUser;
      };

      if (!res.ok || !json.ok || !json.token || !json.user) {
        setError(json.message ?? "Could not sign in.");
        return;
      }

      if (!json.user.isAdmin) {
        setError("This account is not an admin.");
        return;
      }

      setAdminSession({
        token: json.token,
        user: json.user,
      });
      router.push("/admin/home");
      router.refresh();
    } catch {
      setError("Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="bg-white px-6 py-16 sm:px-10 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[28rem]">
        <p className="flex items-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[#a6342a]">
          <span className="h-px w-5 bg-[#a6342a]" />
          Admin
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-[2.5rem] leading-none tracking-[-0.03em] text-[#1c2118]">
          Sign in
        </h1>
        <p className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-[#6b6560]">
          Sign in with an admin account to review gatherings and manage Majlis.
        </p>

        <form onSubmit={handleSubmit} className="mt-12">
          <label className="block">
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#8c857c]">
              Email address
            </span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-3 w-full border-0 border-b border-[#cfc8bf] bg-transparent pb-2 text-[1rem] text-[#1c2118] outline-none focus:border-[#1c2118]"
            />
          </label>

          <PasswordField
            label="Password"
            name="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />

          {error ? (
            <p className="mt-6 text-[0.85rem] text-[#b8573a]">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="mt-10 w-full rounded-full bg-black py-3.5 text-[0.9rem] font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
