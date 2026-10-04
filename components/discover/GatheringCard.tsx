import Link from "next/link";
import { Bookmark, Check, MapPin } from "lucide-react";
import { formatCardDate, type Gathering } from "@/lib/gatherings";

type GatheringCardProps = {
  gathering: Gathering;
  saved: boolean;
  onToggleSave: () => void;
};

export default function GatheringCard({
  gathering,
  saved,
  onToggleSave,
}: GatheringCardProps) {
  const date = formatCardDate(gathering.date);

  return (
    <article className="relative flex items-start gap-4 border-b border-[#ece8e2] py-8 sm:gap-7">
      <Link
        href={`/gatherings/${gathering.id}`}
        className="absolute inset-0"
        aria-label={gathering.title}
      />
      <div className="w-11 shrink-0 pt-1 text-right sm:w-14">
        <p className="font-[family-name:var(--font-display)] text-[1.65rem] leading-none tracking-[-0.03em] text-[#1c2118]">
          {date.day}
        </p>
        <p className="mt-1 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#a6342a]">
          {date.month}
        </p>
      </div>

      <div className="relative hidden aspect-[5/4] w-[7.5rem] shrink-0 overflow-hidden bg-[#f3f1ec] sm:block">
        {gathering.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={gathering.image}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        {gathering.image ? (
          <div className="relative mb-3 aspect-[16/10] overflow-hidden bg-[#f3f1ec] sm:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gathering.image}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
        <p className="text-[0.9rem] text-[#5c574f]">
          {date.long} · {gathering.time}
        </p>
        <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-[1.35rem] leading-tight tracking-[-0.02em] text-[#1c2118] sm:text-[1.45rem]">
          {gathering.title}
        </h3>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8rem] text-[#8c857c]">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {gathering.city}
          </span>
          {gathering.miles != null ? (
            <>
              <span>·</span>
              <span>{gathering.miles}mi</span>
            </>
          ) : null}
          {gathering.tags.map((tag) => (
            <span key={tag} className="contents">
              <span>·</span>
              <span>{tag}</span>
            </span>
          ))}
        </p>
        <p className="mt-3 max-w-[36rem] text-[0.92rem] leading-relaxed text-[#4a453e]">
          {gathering.description}
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-[0.8rem] text-[#5c574f]">
          {gathering.verified ? (
            <Check className="h-3.5 w-3.5 text-[#1c2118]" strokeWidth={2.2} />
          ) : null}
          {gathering.host}
        </p>
      </div>

      <button
        type="button"
        onClick={onToggleSave}
        className="relative z-10 mt-1 shrink-0 text-[#8c857c] transition-colors hover:text-[#1c2118]"
        aria-label={saved ? "Remove bookmark" : "Bookmark gathering"}
        aria-pressed={saved}
      >
        <Bookmark
          className="h-5 w-5"
          fill={saved ? "currentColor" : "none"}
        />
      </button>
    </article>
  );
}
