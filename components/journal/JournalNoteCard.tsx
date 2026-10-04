import Link from "next/link";
import { formatPostedDate, type PublicJournal } from "@/lib/journal-posts";

export default function JournalNoteCard({ note }: { note: PublicJournal }) {
  const meta = [note.description, formatPostedDate(note.date_posted)].filter(Boolean);

  return (
    <article className="w-full border-b border-[#ece8e2] py-6">
      <p className="text-[0.72rem] tracking-[0.01em] text-[#8c857c]">
        {meta.join(" · ")}
      </p>
      <h2 className="mt-2 w-full font-[family-name:var(--font-display)] text-[1.45rem] leading-snug tracking-[-0.025em] text-[#1c2118] sm:text-[1.6rem]">
        <Link href={`/journal/${note.slug}`} className="hover:opacity-70">
          {note.name}
        </Link>
      </h2>
      <p className="mt-2 w-full text-[0.9rem] leading-relaxed text-[#6b6560]">
        {note.about.slice(0, 300)}...
      </p>
      <Link
        href={`/journal/${note.slug}`}
        className="mt-4 inline-block text-[0.85rem] font-medium text-[#1c2118] transition-opacity hover:opacity-60"
      >
        Read
      </Link>
    </article>
  );
}
