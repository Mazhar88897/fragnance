"use client";

import Link from "next/link";
import { useState } from "react";
import MajlisMark from "@/components/MajlisMark";

const footerLinks = [
  { href: "/", label: "Discover" },
  { href: "/journal", label: "Journal" },
  { href: "/sign-in", label: "Submit a gathering" },
];

export default function SiteFooter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || busy) return;

    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setError(json.message ?? "Could not subscribe.");
        return;
      }
      setSent(true);
    } catch {
      setError("Could not subscribe.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <footer>
      <section className="border-t border-[#ece8e2] bg-white px-6 py-20 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-xl text-center">
          <p className="flex items-center justify-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[#a6342a]">
            <span className="h-px w-5 bg-[#a6342a]" />
            Stay in the loop
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-[2rem] leading-tight tracking-[-0.03em] text-[#1c2118] sm:text-[2.35rem]">
            Get the Journal in your inbox
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[0.95rem] leading-relaxed text-[#6b6560]">
            One email a month with new stories, and a short note on what&apos;s
            gathering near you.
          </p>

          {sent ? (
            <p className="mt-10 font-[family-name:var(--font-display)] text-lg text-[#1c2118]">
              You&apos;re on the list.
            </p>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="mx-auto mt-10 flex max-w-md items-end gap-4"
            >
              <label className="min-w-0 flex-1 text-left">
                <span className="sr-only">Email address</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full border-0 border-b border-[#cfc8bf] bg-transparent pb-2 text-[0.95rem] text-[#1c2118] outline-none placeholder:text-[#8c857c] focus:border-[#1c2118]"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="shrink-0 rounded-full bg-black px-5 py-2.5 text-[0.85rem] font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-50"
              >
                {busy ? "Saving…" : "Subscribe"}
              </button>
            </form>
          )}
          {error ? (
            <p className="mt-4 text-[0.85rem] text-[#b8573a]">{error}</p>
          ) : null}
        </div>
      </section>

      <section className="bg-[#eef3ea] px-6 py-12 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="flex items-center gap-[0.45rem] text-[#1c2118]"
            >
              <MajlisMark className="h-[0.95rem] w-[0.95rem]" />
              <span className="font-[family-name:var(--font-display)] text-[1.35rem] leading-none tracking-[-0.02em]">
                Majlis
              </span>
            </Link>
            <nav className="flex flex-wrap items-center gap-x-7 gap-y-2 text-[0.9rem] text-[#1c2118]">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-opacity hover:opacity-60"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-8 flex flex-col gap-2 border-t border-[#1c2118]/10 pt-6 text-[0.8rem] text-[#6b6560] sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Majlis.</p>
            <p>Where hearts gather.</p>
          </div>
        </div>
      </section>
    </footer>
  );
}
