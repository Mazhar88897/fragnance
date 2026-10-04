"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import JournalNoteCard from "@/components/journal/JournalNoteCard";
import type { PublicJournal } from "@/lib/journal-posts";

const PAGE_SIZE = 3;

export default function JournalView({ notes }: { notes: PublicJournal[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = notes.slice(0, visible);
  const canLoadMore = visible < notes.length;

  return (
    <main className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 pb-16 pt-8 sm:px-8 lg:px-10">
        <p className="flex items-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[#a6342a]">
          <span className="h-px w-5 bg-[#a6342a]" />
          The journal
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[2.4rem] leading-none tracking-[-0.03em] text-[#1c2118]">
          Notes
        </h1>

        {notes.length === 0 ? (
          <p className="mt-10 text-[0.95rem] text-[#8c857c]">No notes yet.</p>
        ) : (
          <div className="mt-8 w-full">
            {shown.map((note) => (
              <JournalNoteCard key={note.id} note={note} />
            ))}
          </div>
        )}

        {canLoadMore ? (
          <div className="flex justify-center pt-10">
            <button
              type="button"
              onClick={() => setVisible((count) => count + PAGE_SIZE)}
              className="rounded-full border border-[#1c2118] px-5 py-2.5 text-[0.85rem] text-[#1c2118] transition-colors hover:bg-[#1c2118] hover:text-white"
            >
              Load more
            </button>
          </div>
        ) : notes.length > 0 ? (
          <Link
            href="/journal/archive"
            className="mt-8 inline-flex items-center gap-2 text-[0.85rem] text-[#1c2118] transition-opacity hover:opacity-60"
          >
            Browse the archive
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
    </main>
  );
}
