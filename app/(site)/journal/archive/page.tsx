import Link from "next/link";
import { formatPostedDate } from "@/lib/journal-posts";
import { listPublicJournals } from "@/lib/journal-server";

export const dynamic = "force-dynamic";

export default async function JournalArchivePage() {
  const notes = await listPublicJournals();

  return (
    <main className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 pb-16 pt-8 sm:px-8 lg:px-10">
        <p className="flex items-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[#a6342a]">
          <span className="h-px w-5 bg-[#a6342a]" />
          The journal
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[2.4rem] leading-none tracking-[-0.03em] text-[#1c2118]">
          Archive
        </h1>

        {notes.length === 0 ? (
          <p className="mt-10 text-[0.95rem] text-[#8c857c]">No notes yet.</p>
        ) : (
          <ul className="mt-8 w-full divide-y divide-[#ece8e2] border-y border-[#ece8e2]">
            {notes.map((note) => (
              <li key={note.id}>
                <Link
                  href={`/journal/${note.slug}`}
                  className="block py-6 transition-opacity hover:opacity-70"
                >
                  <p className="text-[0.8rem] text-[#8c857c]">
                    {[note.description, formatPostedDate(note.date_posted)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-[1.35rem] leading-tight tracking-[-0.02em] text-[#1c2118]">
                    {note.name}
                  </h2>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
