"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Toast from "@/components/auth/Toast";
import type { PublicUser } from "@/lib/auth-types";
import { getUserSession, setUserSession } from "@/lib/user-session";

const fieldClass =
  "mt-3 w-full border-0 border-b border-[#cfc8bf] bg-transparent pb-2 text-[1rem] text-[#1c2118] outline-none focus:border-[#1c2118]";

export default function ProfileView() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const session = getUserSession();
    if (session?.user) {
      setName(session.user.name);
      setBusinessName(session.user.businessName);
      setBusinessEmail(session.user.businessEmail ?? "");
      setReady(true);
    }

    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) {
          router.replace("/sign-in");
          return;
        }
        const json = (await res.json()) as { user?: PublicUser };
        if (!json.user) {
          router.replace("/sign-in");
          return;
        }
        setName(json.user.name);
        setBusinessName(json.user.businessName);
        setBusinessEmail(json.user.businessEmail ?? "");
        setUserSession({
          token: session?.token ?? "",
          user: json.user,
        });
        setReady(true);
      })
      .catch(() => {
        if (!getUserSession()) router.replace("/sign-in");
      });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, businessName, businessEmail }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        message?: string;
        user?: PublicUser;
      };
      if (!res.ok || !json.ok || !json.user) {
        setError(json.message ?? "Could not save profile.");
        return;
      }

      const current = getUserSession();
      setUserSession({
        token: current?.token ?? "",
        user: json.user,
      });
      setToast("Profile updated.");
      window.setTimeout(() => setToast(null), 3000);
    } catch {
      setError("Could not save profile.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <main className="bg-white px-6 py-20">
        <p className="text-[#8c857c]">Loading…</p>
      </main>
    );
  }

  return (
    <main className="bg-white px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
      {toast ? <Toast message={toast} /> : null}

      <div className="mx-auto w-full max-w-[28rem]">
        <p className="flex items-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[#a6342a]">
          <span className="h-px w-5 bg-[#a6342a]" />
          Organisation account
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[2.5rem] leading-none tracking-[-0.03em] text-[#1c2118]">
          Profile
        </h1>
        <p className="mt-4 text-[0.95rem] text-[#6b6560]">
          Update your name and organisation details.
        </p>

        <form onSubmit={handleSubmit} className="mt-12">
          <label className="block">
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#8c857c]">
              Name
            </span>
            <input
              type="text"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
            />
          </label>

          <label className="mt-8 block">
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#8c857c]">
              Business name
            </span>
            <input
              type="text"
              name="businessName"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className={fieldClass}
            />
          </label>

          <label className="mt-8 block">
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#8c857c]">
              Business email{" "}
              <span className="normal-case tracking-normal text-[#b0aaa3]">
                optional
              </span>
            </span>
            <input
              type="email"
              name="businessEmail"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              className={fieldClass}
            />
          </label>

          {error ? (
            <p className="mt-6 text-[0.85rem] text-[#b8573a]">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="mt-10 w-full rounded-full bg-black py-3.5 text-[0.9rem] font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
        </form>

        <Link
          href="/dashboard"
          className="mt-8 inline-block text-[0.9rem] text-[#1c2118] transition-opacity hover:opacity-60"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
