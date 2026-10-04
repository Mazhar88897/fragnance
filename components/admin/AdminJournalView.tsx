"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAdminSignedIn } from "@/lib/admin-session";
import { formatPostedDate, type PublicJournal } from "@/lib/journal-posts";

export default function AdminJournalView() {
  const router = useRouter();
  const [notes, setNotes] = useState<PublicJournal[]>([]);
  const [pendingDelete, setPendingDelete] = useState<PublicJournal | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAdminSignedIn()) {
      router.replace("/admin");
      return;
    }

    fetch("/api/admin/journal")
      .then(async (res) => {
        const json = (await res.json()) as {
          ok?: boolean;
          notes?: PublicJournal[];
          message?: string;
        };
        if (!res.ok || !json.ok) {
          throw new Error(json.message ?? "Could not load journal.");
        }
        setNotes(json.notes ?? []);
        setReady(true);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not load journal.");
        setReady(true);
      });
  }, [router]);

  async function confirmDelete() {
    if (!pendingDelete || deletingId) return;
    const id = pendingDelete.id;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/journal/${id}`, { method: "DELETE" });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setError(json.message ?? "Could not delete note.");
        return;
      }
      setNotes((current) => current.filter((note) => note.id !== id));
      setPendingDelete(null);
    } catch {
      setError("Could not delete note.");
    } finally {
      setDeletingId(null);
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
              Journal
            </h1>
            <p className="mt-2 text-[0.85rem] text-[#6b6560]">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </p>
          </div>
          <Link
            href="/admin/journal/new"
            className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2.5 text-[0.85rem] font-medium text-white transition-opacity hover:opacity-85"
          >
            Add a note
          </Link>
        </div>

        {error ? (
          <p className="mt-8 text-[0.85rem] text-[#b8573a]">{error}</p>
        ) : notes.length === 0 ? (
          <p className="mt-8 text-[0.85rem] text-[#8c857c]">No notes yet.</p>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-[0.85rem]">
              <thead>
                <tr className="border-b border-[#ece7e0] text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#8c857c]">
                  <th className="pb-2 pr-4 font-medium">Name</th>
                  <th className="pb-2 pr-4 font-medium">Date posted</th>
                  <th className="pb-2 pr-4 font-medium">Description</th>
                  <th className="pb-2 pr-4 font-medium">Tags</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((note) => (
                  <tr
                    key={note.id}
                    className="border-b border-[#f2eee8] text-[#1c2118]"
                  >
                    <td className="py-2.5 pr-4">{note.name}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4 text-[#6b6560]">
                      {formatPostedDate(note.date_posted)}
                    </td>
                    <td className="max-w-[20rem] truncate py-2.5 pr-4 text-[#6b6560]">
                      {note.description}
                    </td>
                    <td className="py-2.5 pr-4 text-[#6b6560]">
                      {note.tags.join(", ") || "—"}
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/journal/${note.id}/edit`}
                          aria-label={`Edit ${note.name}`}
                          className="flex h-8 w-8 items-center justify-center text-[#1c2118] transition-opacity hover:opacity-60"
                        >
                          <Pencil className="h-4 w-4" strokeWidth={1.6} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(note)}
                          aria-label={`Delete ${note.name}`}
                          className="flex h-8 w-8 items-center justify-center text-[#1c2118] transition-opacity hover:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.6} />
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
            className="w-full max-w-[26rem] bg-white px-8 py-8"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="flex items-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[#a6342a]">
              <span className="h-px w-5 bg-[#a6342a]" />
              Delete note
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-[1.85rem] leading-tight tracking-[-0.03em] text-[#1c2118]">
              Remove this note?
            </h2>
            <p className="mt-3 text-[0.95rem] text-[#6b6560]">
              {pendingDelete.name} will be deleted. This cannot be undone.
            </p>
            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={Boolean(deletingId)}
                className="rounded-full border border-[#e6e0d8] px-5 py-2 text-[0.9rem] text-[#1c2118] disabled:opacity-50"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={Boolean(deletingId)}
                className="rounded-full bg-[#a6342a] px-5 py-2 text-[0.9rem] text-white disabled:opacity-50"
              >
                {deletingId ? "Deleting…" : "Delete note"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
