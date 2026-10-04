"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import MajlisMark from "@/components/MajlisMark";
import { clearUserSession } from "@/lib/user-session";

export default function DashboardTopBar() {
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    clearUserSession();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white [height:var(--topbar-height,4.25rem)]">
      <div className="flex h-full w-full items-center justify-between px-6 sm:px-10 lg:px-14">
        <Link
          href="/dashboard"
          className="flex items-center gap-[0.45rem] text-[#1c2118]"
        >
          <MajlisMark className="h-[0.95rem] w-[0.95rem]" />
          <span className="font-[family-name:var(--font-display)] text-[1.375rem] font-medium leading-none tracking-[-0.02em]">
            Majlis
          </span>
        </Link>

        <button
          type="button"
          onClick={signOut}
          className="text-[0.85rem] text-[#1c2118] transition-opacity hover:opacity-60"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
