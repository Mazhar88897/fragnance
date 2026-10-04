"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PasswordField from "@/components/auth/PasswordField";
import Toast from "@/components/auth/Toast";

const fieldClass =
  "mt-3 w-full border-0 border-b border-[#cfc8bf] bg-transparent pb-2 text-[1rem] text-[#1c2118] outline-none focus:border-[#1c2118]";

export default function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    if (password !== passwordAgain) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          businessName,
          businessEmail,
          password,
          passwordAgain,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setError(json.message ?? "Could not create account.");
        return;
      }

      setToast("Account created. Taking you to sign in…");
      window.setTimeout(() => {
        router.push("/sign-in?created=1");
      }, 1200);
    } catch {
      setError("Could not create account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="bg-white px-6 py-16 sm:px-10 sm:py-20 lg:py-24">
      {toast ? <Toast message={toast} /> : null}

      <div className="mx-auto w-full max-w-[28rem]">
        <p className="flex items-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[#a6342a]">
          <span className="h-px w-5 bg-[#a6342a]" />
          For organisations
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-[2.5rem] leading-none tracking-[-0.03em] text-[#1c2118]">
          Sign up
        </h1>
        <p className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-[#6b6560]">
          Create an account to submit gatherings and manage your organisation.
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
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
            />
          </label>

          <label className="mt-8 block">
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#8c857c]">
              Email
            </span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              autoComplete="organization"
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
              autoComplete="off"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              className={fieldClass}
            />
          </label>

          <PasswordField
            label="Password"
            name="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            minLength={8}
          />

          <PasswordField
            label="Password again"
            name="passwordAgain"
            value={passwordAgain}
            onChange={setPasswordAgain}
            autoComplete="new-password"
            minLength={8}
          />

          {error ? (
            <p className="mt-6 text-[0.85rem] text-[#b8573a]">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="mt-10 w-full rounded-full bg-black py-3.5 text-[0.9rem] font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-8 text-center text-[0.9rem] text-[#6b6560]">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-[#1c2118] underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
