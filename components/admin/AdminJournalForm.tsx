"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HtmlEditor, { htmlIsEmpty } from "@/components/admin/HtmlEditor";
import { isAdminSignedIn } from "@/lib/admin-session";
import type { PublicJournal } from "@/lib/journal-posts";

const fieldClass =
  "mt-3 w-full border-0 border-b border-[#cfc8bf] bg-transparent pb-2 text-[1rem] text-[#1c2118] outline-none focus:border-[#1c2118]";

export default function AdminJournalForm({ noteId }: { noteId?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [datePosted, setDatePosted] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [about, setAbout] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(!noteId);

  useEffect(() => {
    if (!isAdminSignedIn()) {
      router.replace("/admin");
      return;
    }
  }, [router]);

  useEffect(() => {
    if (!noteId) return;

    fetch(`/api/admin/journal/${noteId}`)
      .then(async (res) => {
        const json = (await res.json()) as {
          ok?: boolean;
          note?: PublicJournal;
          message?: string;
        };
        if (!res.ok || !json.note) {
          throw new Error(json.message ?? "Journal note not found.");
        }
        setName(json.note.name);
        setDescription(json.note.description);
        setTags(json.note.tags.join(", "));
        const posted = new Date(json.note.date_posted);
        const pad = (n: number) => String(n).padStart(2, "0");
        setDatePosted(
          `${posted.getFullYear()}-${pad(posted.getMonth() + 1)}-${pad(posted.getDate())}`
        );
        setAbout(json.note.about);
        setReady(true);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not load note.");
      });
  }, [noteId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      if (htmlIsEmpty(about)) {
        setError("About is required.");
        return;
      }

      const res = await fetch(
        noteId ? `/api/admin/journal/${noteId}` : "/api/admin/journal",
        {
          method: noteId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description,
            tags: tags.split(",").map((item) => item.trim()).filter(Boolean),
            date_posted: datePosted,
            about,
          }),
        }
      );
      const json = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setError(json.message ?? "Could not save journal note.");
        return;
      }
      router.push("/admin/journal");
      router.refresh();
    } catch {
      setError("Could not save journal note.");
    } finally {
      setBusy(false);
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
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[2.5rem] leading-none tracking-[-0.03em] text-[#1c2118]">
          {noteId ? "Edit journal note" : "Add a journal note"}
        </h1>

        <form onSubmit={handleSubmit} className="mt-12">
          <div className="max-w-[40rem]">
            <label className="block">
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#8c857c]">
                Name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={fieldClass}
              />
            </label>

            <label className="mt-8 block">
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#8c857c]">
                Description
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className={`${fieldClass} resize-y`}
              />
            </label>

            <label className="mt-8 block">
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#8c857c]">
                Date posted
              </span>
              <input
                type="date"
                value={datePosted}
                onChange={(e) => setDatePosted(e.target.value)}
                required
                className={fieldClass}
              />
            </label>

            <label className="mt-8 block">
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#8c857c]">
                Tags
              </span>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="comma separated"
                className={fieldClass}
              />
            </label>
          </div>

          <div className="mt-8">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#8c857c]">
              About
            </p>
            <div className="mt-3">
              <HtmlEditor
                value={about}
                onChange={setAbout}
                placeholder="Write the journal note…"
                minHeight="280px"
              />
            </div>
          </div>

          {error ? (
            <p className="mt-6 max-w-[40rem] text-[0.85rem] text-[#b8573a]">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="mt-10 w-full max-w-[40rem] rounded-full bg-black py-3.5 text-[0.9rem] font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {busy ? "Saving…" : noteId ? "Save note" : "Post note"}
          </button>
        </form>

        <Link
          href="/admin/journal"
          className="mt-8 inline-block text-[0.9rem] text-[#1c2118] transition-opacity hover:opacity-60"
        >
          Back to journal
        </Link>
      </div>
    </main>
  );
}
