import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import GatheringInfoCard from "@/components/discover/GatheringInfoCard";
import type { PublicGatheringDetail } from "@/lib/gathering-server";
import { GATHERING_TYPES } from "@/lib/gatherings";

export default function GatheringArticle({
  gathering,
}: {
  gathering: PublicGatheringDetail;
}) {
  const typeLabel =
    GATHERING_TYPES.find((item) => item.id === gathering.type_id)?.label ??
    gathering.type;

  return (
    <main className="bg-white">
      <article className="mx-auto w-full max-w-8xl px-6 pb-20 pt-8 sm:px-10 lg:px-14 lg:pb-28 lg:pt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[0.92rem] text-[#6b6560] transition-colors hover:text-[#1c2118]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Back to discover
        </Link>

        <p className="mt-14 flex items-center gap-3 text-[0.8rem] font-bold uppercase tracking-[0.24em] text-[#a6342a]">
          <span className="h-px w-7 bg-[#a6342a]" />
          {typeLabel}
        </p>
        <h1 className="mt-4 max-w-[24ch] font-[family-name:var(--font-display)] text-[2.7rem] leading-[1.02] tracking-[-0.04em] text-[#1c2118] sm:text-[4.15rem]">
          {gathering.title}
        </h1>

        <div className="mt-16 grid items-start gap-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-x-16">
          <aside className="lg:col-start-2 lg:row-start-1 lg:sticky lg:top-6">
            <GatheringInfoCard
              title={gathering.title}
              datetime={gathering.datetime}
              location={gathering.location}
              locationLink={gathering.location_link}
              host={gathering.host}
              verified={gathering.verified}
              attendance={gathering.attendance}
              booking={gathering.booking}
            />
          </aside>

          <div className="min-w-0 pl-6 sm:pl-10 lg:col-start-1 lg:row-start-1 lg:pl-14">
            <h2 className="font-[family-name:var(--font-display)] text-[2rem] leading-tight tracking-[-0.03em] text-[#1c2118]">
              About this gathering
            </h2>
            <div
              className="blog-html mt-7 max-w-[46rem] text-base leading-[1.9] text-[#6b6560] [&_a]:text-[#1c2118] [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:font-[family-name:var(--font-display)] [&_h2]:text-[1.35rem] [&_h2]:text-[#1c2118] [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:mb-3 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: gathering.about }}
            />

            <div
              className={`mt-14 flex items-center gap-5 border-t border-[#ece8e2] pt-8 ${
                gathering.speakers.length || gathering.gathering_photos.length
                  ? "border-b pb-8"
                  : ""
              }`}
            >
              <span className="flex h-[3rem] w-[3rem] shrink-0 items-center justify-center rounded-full bg-[#f4f1eb] text-[1rem] font-medium tracking-[0.08em] text-[#1c2118]">
                {gathering.hostInitials}
              </span>
              <div>
                <p className="text-[1rem] font-bold leading-snug text-[#1c2118]">
                  Hosted by {gathering.host}
                </p>
                <p className="mt-1.5 text-[0.86rem] text-[#8c857c]">
                  {gathering.verified
                    ? "Verified organisation"
                    : "Community-hosted"}
                  {gathering.hostSince
                    ? ` · Hosting since ${gathering.hostSince}`
                    : ""}
                </p>
              </div>
            </div>

            {gathering.speakers.length ? (
              <section className="mt-14">
                <h2 className="font-[family-name:var(--font-display)] text-[2rem] leading-tight tracking-[-0.03em] text-[#1c2118]">
                  Speakers & reciters
                </h2>
                <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                  {gathering.speakers.map((speaker) => (
                    <div key={`${speaker.speaker_name}-${speaker.role}`}>
                      <p className="text-[1rem] font-semibold leading-snug text-[#1c2118]">
                        {speaker.speaker_name}
                      </p>
                      {speaker.role ? (
                        <p className="mt-1.5 text-[0.8rem] text-[#9a948c]">
                          {speaker.role}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {gathering.gathering_photos.length ? (
              <div className="mt-10 grid gap-6">
                {gathering.gathering_photos.map((src) => (
                  <div
                    key={src}
                    className="aspect-[16/9] overflow-hidden bg-[#f3f1ec]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </article>
    </main>
  );
}
