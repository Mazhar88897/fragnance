"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { isAdminSignedIn } from "@/lib/admin-session";
import type { PublicUser } from "@/lib/auth-types";
import type { PublicGathering } from "@/lib/gathering-posts";
import { GATHERING_TABS } from "@/lib/gatherings";

type AdminGathering = PublicGathering & {
  organisation: PublicUser | null;
};

function formatWhen(value: string) {
  const date = new Date(value);
  const day = date
    .toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
    .replace(",", "");
  const time = date
    .toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/\s/g, "")
    .toLowerCase();
  return `${day}, ${time}`;
}

function typeLabel(typeId: string, type: string) {
  return GATHERING_TABS.find((tab) => tab.id === typeId)?.label ?? type;
}

export default function AdminGatheringsView() {
  const router = useRouter();
  const [gatherings, setGatherings] = useState<AdminGathering[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAdminSignedIn()) {
      router.replace("/admin");
      return;
    }

    fetch("/api/admin/gatherings")
      .then(async (res) => {
        const json = (await res.json()) as {
          ok?: boolean;
          gatherings?: AdminGathering[];
          message?: string;
        };
        if (!res.ok || !json.ok) {
          throw new Error(json.message ?? "Could not load gatherings.");
        }
        setGatherings(json.gatherings ?? []);
        setReady(true);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not load gatherings.");
        setReady(true);
      });
  }, [router]);

  async function setApproval(id: string, approval: boolean) {
    if (savingId) return;
    setSavingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/gatherings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approval }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        gathering?: PublicGathering;
        message?: string;
      };
      if (!res.ok || !json.ok || !json.gathering) {
        setError(json.message ?? "Could not update gathering.");
        return;
      }
      setGatherings((current) =>
        current.map((item) =>
          item.id === id ? { ...item, approval: json.gathering!.approval } : item
        )
      );
    } catch {
      setError("Could not update gathering.");
    } finally {
      setSavingId(null);
    }
  }

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-[2rem] leading-none tracking-[-0.03em] text-[#1c2118]">
              Gatherings
            </h1>
            <p className="mt-2 text-[0.85rem] text-[#6b6560]">
              {gatherings.length}{" "}
              {gatherings.length === 1 ? "gathering" : "gatherings"}
            </p>
          </div>
          <Link
            href="/admin/gatherings/new"
            className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2.5 text-[0.85rem] font-medium text-white transition-opacity hover:opacity-85"
          >
            Add a gathering
          </Link>
        </div>

        {error ? (
          <p className="mt-8 text-[0.85rem] text-[#b8573a]">{error}</p>
        ) : gatherings.length === 0 ? (
          <p className="mt-8 text-[0.85rem] text-[#8c857c]">
            No gatherings posted yet.
          </p>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left text-[0.85rem]">
              <thead>
                <tr className="border-b border-[#ece7e0] text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#8c857c]">
                  <th className="w-12 pb-2 pr-3 font-medium"> </th>
                  <th className="pb-2 pr-4 font-medium">Title</th>
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 pr-4 font-medium">Location</th>
                  <th className="pb-2 pr-4 font-medium">Organisation</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {gatherings.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#f2eee8] text-[#1c2118]"
                  >
                    <td className="py-2 pr-3">
                      <div className="h-9 w-11 overflow-hidden bg-[#f3f1ec]">
                        {item.gathering_photos[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.gathering_photos[0]}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                    </td>
                    <td className="py-2 pr-4">{item.title}</td>
                    <td className="py-2 pr-4 text-[#6b6560]">
                      {typeLabel(item.type_id, item.type)}
                    </td>
                    <td className="whitespace-nowrap py-2 pr-4 text-[#6b6560]">
                      {formatWhen(item.datetime)}
                    </td>
                    <td className="py-2 pr-4 text-[#6b6560]">{item.location}</td>
                    <td className="py-2 pr-4 text-[#6b6560]">
                      {item.organisation?.businessName ?? "—"}
                    </td>
                    <td className="py-2 pr-4 text-[#6b6560]">
                      {item.approval ? "Approved" : "Pending"}
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        {item.organisation?.isAdmin ? (
                          <Link
                            href={`/admin/gatherings/${item.id}/edit`}
                            aria-label={`Edit ${item.title}`}
                            className="flex h-8 w-8 items-center justify-center text-[#1c2118] transition-opacity hover:opacity-60"
                          >
                            <Pencil className="h-4 w-4" strokeWidth={1.6} />
                          </Link>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setApproval(item.id, !item.approval)}
                          disabled={savingId === item.id}
                          className={`rounded-full px-3 py-1 text-[0.75rem] font-medium transition-opacity hover:opacity-85 disabled:opacity-50 ${
                            item.approval
                              ? "border border-[#e6e0d8] text-[#1c2118]"
                              : "bg-[#a6342a] text-white"
                          }`}
                        >
                          {savingId === item.id
                            ? "Saving…"
                            : item.approval
                              ? "Unapprove"
                              : "Approve"}
                        </button>
                      </div>
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
