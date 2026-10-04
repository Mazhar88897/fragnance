"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAdminSignedIn } from "@/lib/admin-session";
import type { PublicUser } from "@/lib/auth-types";

export default function AdminUsersView({
  adminsOnly = false,
}: {
  adminsOnly?: boolean;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAdminSignedIn()) {
      router.replace("/admin");
      return;
    }

    fetch(adminsOnly ? "/api/admin/admins" : "/api/admin/users")
      .then(async (res) => {
        const json = (await res.json()) as {
          ok?: boolean;
          users?: PublicUser[];
          admins?: PublicUser[];
          message?: string;
        };
        if (!res.ok || !json.ok) {
          throw new Error(
            json.message ??
              (adminsOnly ? "Could not load admins." : "Could not load users.")
          );
        }
        setUsers(adminsOnly ? json.admins ?? [] : json.users ?? []);
        setReady(true);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not load users.");
        setReady(true);
      });
  }, [adminsOnly, router]);

  if (!ready && !error) {
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
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[2rem] leading-none tracking-[-0.03em] text-[#1c2118]">
          {adminsOnly ? "Admins" : "Users"}
        </h1>
        <p className="mt-2 text-[0.85rem] text-[#6b6560]">
          {users.length}{" "}
          {adminsOnly
            ? users.length === 1
              ? "admin"
              : "admins"
            : users.length === 1
              ? "account"
              : "accounts"}
        </p>

        {error ? (
          <p className="mt-8 text-[0.85rem] text-[#b8573a]">{error}</p>
        ) : users.length === 0 ? (
          <p className="mt-8 text-[0.85rem] text-[#8c857c]">
            {adminsOnly ? "No admins yet." : "No users yet."}
          </p>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-[0.85rem]">
              <thead>
                <tr className="border-b border-[#ece7e0] text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#8c857c]">
                  <th className="pb-2 pr-4 font-medium">Organisation</th>
                  <th className="pb-2 pr-4 font-medium">Name</th>
                  <th className="pb-2 pr-4 font-medium">Email</th>
                  <th className="pb-2 font-medium">Payment</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[#f2eee8] text-[#1c2118]"
                  >
                    <td className="py-2.5 pr-4">{user.businessName}</td>
                    <td className="py-2.5 pr-4 text-[#6b6560]">{user.name}</td>
                    <td className="py-2.5 pr-4 text-[#6b6560]">{user.email}</td>
                    <td className="py-2.5 text-[#6b6560]">
                      {user.paymentStatus ? "Paid" : "Unpaid"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
