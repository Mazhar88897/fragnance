"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MajlisMark from "@/components/MajlisMark";
import { clearAdminSession, isAdminSignedIn } from "@/lib/admin-session";

export default function AdminTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(isAdminSignedIn());
  }, [pathname]);

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    clearAdminSession();
    router.push("/admin");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#1a2418]">
      <div className="flex h-14 items-center justify-between px-5 sm:px-8">
        <Link
          href={signedIn ? "/admin/home" : "/admin"}
          className="flex items-center gap-2.5 text-white"
        >
          <MajlisMark className="h-4 w-4" />
          <span className="font-[family-name:var(--font-display)] text-lg leading-none tracking-[-0.02em]">
            Majlis
          </span>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/80">
            Admin
          </span>
        </Link>

        <div className="flex items-center gap-5">
          {signedIn ? (
            <>
              <Link
                href="/admin/users"
                className={`text-[0.8rem] font-medium transition-colors hover:text-white ${
                  pathname.startsWith("/admin/users")
                    ? "text-white"
                    : "text-white/70"
                }`}
              >
                Users
              </Link>
              <Link
                href="/admin/admins"
                className={`text-[0.8rem] font-medium transition-colors hover:text-white ${
                  pathname.startsWith("/admin/admins")
                    ? "text-white"
                    : "text-white/70"
                }`}
              >
                Admins
              </Link>
              <Link
                href="/admin/gatherings"
                className={`text-[0.8rem] font-medium transition-colors hover:text-white ${
                  pathname.startsWith("/admin/gatherings")
                    ? "text-white"
                    : "text-white/70"
                }`}
              >
                Gatherings
              </Link>
              <Link
                href="/admin/journal"
                className={`text-[0.8rem] font-medium transition-colors hover:text-white ${
                  pathname.startsWith("/admin/journal")
                    ? "text-white"
                    : "text-white/70"
                }`}
              >
                Journal
              </Link>
            </>
          ) : null}
          <Link
            href="/"
            className="text-[0.8rem] font-medium text-white/70 transition-colors hover:text-white"
          >
            View site
          </Link>
          {signedIn ? (
            <button
              type="button"
              onClick={signOut}
              className="text-[0.8rem] font-medium text-white/70 transition-colors hover:text-white"
            >
              Log out
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
