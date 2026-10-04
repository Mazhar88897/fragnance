"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAdminSession, type AdminSession } from "@/lib/admin-session";

export default function AdminHomeView() {
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    const current = getAdminSession();
    if (!current) {
      router.replace("/admin");
      return;
    }
    setSession(current);
  }, [router]);

  if (!session) {
    return (
      <main className="bg-white px-6 py-20">
        <p className="text-[#8c857c]">Loading…</p>
      </main>
    );
  }

  return (
    <main className="bg-white px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
      <div className="mx-auto w-full max-w-7xl">
        <p className="flex items-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[#a6342a]">
          <span className="h-px w-5 bg-[#a6342a]" />
          Admin
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[2.75rem] leading-none tracking-[-0.03em] text-[#1c2118] sm:text-[3.15rem]">
          Welcome, {session.user.name}
        </h1>
        <p className="mt-4 text-[0.95rem] text-[#6b6560]">
          You are signed in as {session.user.email}.
        </p>
      </div>
    </main>
  );
}
