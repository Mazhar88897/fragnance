"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { PublicUser } from "@/lib/auth-types";
import type { PublicGathering } from "@/lib/gathering-posts";
import { GATHERING_TABS } from "@/lib/gatherings";
import { clearUserSession, getUserSession, setUserSession } from "@/lib/user-session";

function formatGatheringWhen(value: string) {
  const date = new Date(value);
  const day = date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).replace(",", "");
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

function formatRenews(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });
}

export default function DashboardView() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [gatherings, setGatherings] = useState<PublicGathering[]>([]);
  const [postedThisMonth, setPostedThisMonth] = useState(0);
  const [monthlyLimit, setMonthlyLimit] = useState(10);
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PublicGathering | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const applyUser = useCallback((next: PublicUser) => {
    const current = getUserSession();
    setUserSession({
      token: current?.token ?? "",
      user: next,
    });
    setUser(next);
  }, []);

  const loadUser = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    if (!res.ok) {
      router.replace("/sign-in");
      return;
    }
    const json = (await res.json()) as { user?: PublicUser };
    if (!json.user) {
      router.replace("/sign-in");
      return;
    }
    applyUser(json.user);
  }, [applyUser, router]);

  const loadGatherings = useCallback(async () => {
    const res = await fetch("/api/gatherings");
    const json = (await res.json()) as {
      ok?: boolean;
      gatherings?: PublicGathering[];
      postedThisMonth?: number;
      monthlyLimit?: number;
      message?: string;
    };
    if (!res.ok || !json.ok) {
      setError(json.message ?? "Could not load gatherings.");
      return;
    }
    setGatherings(json.gatherings ?? []);
    setPostedThisMonth(json.postedThisMonth ?? 0);
    setMonthlyLimit(json.monthlyLimit ?? 10);
  }, []);

  useEffect(() => {
    const session = getUserSession();
    if (session?.user) setUser(session.user);
    loadUser().catch(() => {
      if (!getUserSession()) router.replace("/sign-in");
    });
    loadGatherings().catch(() => {
      setError("Could not load gatherings.");
    });
  }, [loadGatherings, loadUser, router]);

  async function startPayment() {
    if (paying) return;
    setPaying(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const json = (await res.json()) as {
        ok?: boolean;
        url?: string;
        message?: string;
      };
      if (!res.ok || !json.ok || !json.url) {
        setError(json.message ?? "Could not start payment.");
        return;
      }
      window.location.href = json.url;
    } catch {
      setError("Could not start payment.");
    } finally {
      setPaying(false);
    }
  }

  async function cancelMembership() {
    if (cancelling) return;
    setCancelling(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/cancel", { method: "POST" });
      const json = (await res.json()) as {
        ok?: boolean;
        user?: PublicUser;
        message?: string;
      };
      if (!res.ok || !json.ok || !json.user) {
        setError(json.message ?? "Could not cancel membership.");
        return;
      }
      applyUser(json.user);
    } catch {
      setError("Could not cancel membership.");
    } finally {
      setCancelling(false);
    }
  }

  async function confirmDeleteGathering() {
    if (!pendingDelete || deletingId) return;
    const id = pendingDelete.id;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/gatherings/${id}`, { method: "DELETE" });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setError(json.message ?? "Could not cancel gathering.");
        return;
      }
      setPendingDelete(null);
      await loadGatherings();
    } catch {
      setError("Could not cancel gathering.");
    } finally {
      setDeletingId(null);
    }
  }

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    clearUserSession();
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return (
      <main className="bg-white px-6 py-20">
        <p className="text-[#8c857c]">Loading…</p>
      </main>
    );
  }

  const payment = user.payment;
  const paid = user.paymentStatus;
  const cancellingAtEnd = paid && payment.cancelAtPeriodEnd;
  const renews = formatRenews(payment.currentPeriodEnd);
  const price =
    payment.amount != null
      ? `£${payment.amount} a month`
      : "£10 a month";

  return (
    <main className="bg-white px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="flex items-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[#a6342a]">
              <span className="h-px w-5 bg-[#a6342a]" />
              Organisation account
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-[2.75rem] leading-none tracking-[-0.03em] text-[#1c2118] sm:text-[3.15rem]">
              {user.businessName}
            </h1>
          </div>

          <div className="text-left sm:pt-1 sm:text-right">
            <p className="text-[0.95rem] text-[#1c2118]">{price}</p>
            <p className="mt-1 text-[0.9rem] text-[#6b6560]">
              {paid
                ? cancellingAtEnd
                  ? `Active until ${renews || "the end of this period"}`
                  : `Active, renews ${renews || "monthly"}`
                : "Unpaid"}
            </p>
            <p className="mt-2 text-[0.9rem] text-[#6b6560]">
              <Link
                href="/dashboard/profile"
                className="transition-opacity hover:text-[#1c2118] hover:opacity-70"
              >
                Profile
              </Link>
              <span className="px-1.5">·</span>
              {paid && !cancellingAtEnd ? (
                <>
                  <button
                    type="button"
                    onClick={cancelMembership}
                    disabled={cancelling}
                    className="transition-opacity hover:text-[#1c2118] hover:opacity-70 disabled:opacity-50"
                  >
                    {cancelling ? "Cancelling…" : "Cancel membership"}
                  </button>
                  <span className="px-1.5">·</span>
                </>
              ) : !paid ? (
                <>
                  <button
                    type="button"
                    onClick={startPayment}
                    disabled={paying}
                    className="text-[#1c2118] transition-opacity hover:opacity-70 disabled:opacity-50"
                  >
                    {paying ? "Opening checkout…" : "Pay now"}
                  </button>
                  <span className="px-1.5">·</span>
                </>
              ) : null}
              <button
                type="button"
                onClick={signOut}
                className="transition-opacity hover:text-[#1c2118] hover:opacity-70"
              >
                Sign out
              </button>
            </p>
            {error ? (
              <p className="mt-2 text-[0.85rem] text-[#b8573a]">{error}</p>
            ) : null}
          </div>
        </div>

        <section className="mt-16 border-t border-[#ece7e0] pt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[#a6342a]">
                <span className="h-px w-5 bg-[#a6342a]" />
                Your gatherings
              </p>
              <p className="mt-2 text-[0.95rem] text-[#6b6560]">
                {postedThisMonth} of {monthlyLimit} this month
              </p>
            </div>
            {paid && postedThisMonth < monthlyLimit ? (
              <Link
                href="/dashboard/gatherings/new"
                className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2.5 text-[0.9rem] font-medium text-white transition-opacity hover:opacity-85"
              >
                Add a gathering
              </Link>
            ) : (
              <p className="text-[0.9rem] text-[#6b6560]">
                {paid
                  ? "Monthly posting limit reached."
                  : "Pay now to post gatherings."}
              </p>
            )}
          </div>

          {gatherings.length === 0 ? (
            <p className="mt-10 text-[0.95rem] text-[#8c857c]">
              No gatherings posted yet.
            </p>
          ) : (
            <ul className="mt-10 divide-y divide-[#f0ebe4]">
              {gatherings.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-10"
                >
                  <div className="flex min-w-0 items-start gap-5 sm:items-center sm:gap-7">
                    <div className="relative aspect-[5/4] w-[6.5rem] shrink-0 overflow-hidden bg-[#f3f1ec] sm:w-[7.5rem]">
                      {item.gathering_photos[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.gathering_photos[0]}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="flex items-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[#a6342a]">
                        <span className="h-px w-5 bg-[#a6342a]" />
                        {typeLabel(item.type_id, item.type)}
                      </p>
                      <h2 className="mt-2 font-[family-name:var(--font-display)] text-[1.7rem] leading-[1.15] tracking-[-0.03em] text-[#1c2118] sm:text-[1.9rem]">
                        {item.title}
                      </h2>
                      <p className="mt-2 text-[0.95rem] text-[#8c857c]">
                        {formatGatheringWhen(item.datetime)}
                        <span className="px-1.5">·</span>
                        {item.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/dashboard/gatherings/${item.id}/edit`}
                      aria-label={`Edit ${item.title}`}
                      className="flex h-10 w-10 items-center justify-center text-[#1c2118] transition-opacity hover:opacity-60"
                    >
                      <Pencil className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.6} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(item)}
                      disabled={deletingId === item.id}
                      aria-label={`Cancel ${item.title}`}
                      className="flex h-10 w-10 items-center justify-center text-[#1c2118] transition-opacity hover:opacity-60 disabled:opacity-50"
                    >
                      <Trash2 className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.6} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {pendingDelete ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => {
            if (!deletingId) setPendingDelete(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-gathering-title"
            className="w-full max-w-[26rem] bg-white px-8 py-8"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="flex items-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[#a6342a]">
              <span className="h-px w-5 bg-[#a6342a]" />
              Cancel gathering
            </p>
            <h2
              id="cancel-gathering-title"
              className="mt-3 font-[family-name:var(--font-display)] text-[1.85rem] leading-tight tracking-[-0.03em] text-[#1c2118]"
            >
              Remove this gathering?
            </h2>
            <p className="mt-3 text-[0.95rem] text-[#6b6560]">
              {pendingDelete.title} will be cancelled. This cannot be undone.
            </p>
            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={Boolean(deletingId)}
                className="rounded-full border border-[#e6e0d8] px-5 py-2 text-[0.9rem] text-[#1c2118] transition-colors hover:border-[#cfc8bf] disabled:opacity-50"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={confirmDeleteGathering}
                disabled={Boolean(deletingId)}
                className="rounded-full bg-[#a6342a] px-5 py-2 text-[0.9rem] text-white transition-opacity hover:opacity-85 disabled:opacity-50"
              >
                {deletingId ? "Cancelling…" : "Cancel gathering"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
