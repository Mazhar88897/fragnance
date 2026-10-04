"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MajlisMark from "@/components/MajlisMark";
import type { PublicUser } from "@/lib/auth-types";
import { clearUserSession, getUserSession } from "@/lib/user-session";

const navLinks = [
  { href: "/", label: "Discover" },
  { href: "/journal", label: "Journal" },
];

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    const session = getUserSession();
    if (session?.user) {
      setUser(session.user);
      return;
    }

    let cancelled = false;
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) return null;
        const json = (await res.json()) as { user?: PublicUser };
        return json.user ?? null;
      })
      .then((next) => {
        if (!cancelled) setUser(next);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    clearUserSession();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white [height:var(--topbar-height,4.25rem)]">
      <div className="grid h-full w-full grid-cols-[1fr_auto_1fr] items-center px-6 sm:px-10 lg:px-14">
        <Link
          href="/"
          className="flex items-center gap-[0.45rem] justify-self-start text-[#1c2118]"
        >
          <MajlisMark className="h-[0.95rem] w-[0.95rem]" />
          <span className="font-[family-name:var(--font-display)] text-[1.375rem] font-medium leading-none tracking-[-0.02em]">
            Majlis
          </span>
        </Link>

        <nav className="flex items-center gap-8 justify-self-center">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/" || pathname.startsWith("/gatherings")
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative font-[family-name:var(--font-display)] text-[1.05rem] leading-none tracking-[-0.01em] transition-colors ${
                  active
                    ? "pb-1.5 text-[#1c2118] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-[#a6342a] after:content-['']"
                    : "text-[#8c857c] hover:text-[#1c2118]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-self-end gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden max-w-[10rem] truncate text-[0.85rem] text-[#1c2118] sm:inline"
              >
                {user.name}
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="text-[0.8rem] text-[#8c857c] transition-colors hover:text-[#1c2118]"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="inline-flex items-center rounded-full bg-black px-5 py-2.5 text-[0.8125rem] font-medium leading-none text-white transition-opacity hover:opacity-85"
            >
              <span className="sm:hidden">Sign in</span>
              <span className="hidden sm:inline">Sign in to submit a gathering</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
