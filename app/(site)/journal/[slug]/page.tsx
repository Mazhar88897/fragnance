import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPostedDate } from "@/lib/journal-posts";
import { getPublicJournalBySlug } from "@/lib/journal-server";

export const dynamic = "force-dynamic";

type JournalArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function JournalArticlePage({
  params,
}: JournalArticlePageProps) {
  const { slug } = await params;
  const note = await getPublicJournalBySlug(slug);

  if (!note) notFound();

  return (
    <main className="bg-white">
      <article className="mx-auto max-w-[40rem] px-6 py-10 sm:px-10 lg:px-0 lg:py-14">
        <p className="text-[0.8rem] text-[#8c857c]">
          {[note.description, formatPostedDate(note.date_posted)].filter(Boolean).join(" · ")}
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-[2.25rem] leading-tight tracking-[-0.03em] text-[#1c2118]">
          {note.name}
        </h1>
        <p className="mt-4 text-[1.02rem] leading-relaxed text-[#6b6560]">
          {note.about.slice(0, 300)}...
        </p>
        <div
          className="blog-html mt-8 space-y-5 text-[1.02rem] leading-relaxed text-[#4a453e] [&_a]:underline [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:font-[family-name:var(--font-display)] [&_h2]:text-xl [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:mb-4"
          dangerouslySetInnerHTML={{ __html: note.about }}
        />
        <Link
          href="/journal"
          className="mt-12 inline-block text-[0.9rem] text-[#1c2118] transition-opacity hover:opacity-60"
        >
          Back to notes
        </Link>
      </article>
    </main>
  );
}
