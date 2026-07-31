import Link from "next/link";
import HeroQuizWalkthrough from "@/components/HeroQuizWalkthrough";

const TICKER_ITEMS = [
  "GCSE CHEMISTRY",
  "GCSE PHYSICS",
  "A LEVEL MATHS",
  "A LEVEL BIOLOGY",
  "A LEVEL CHEMISTRY",
  "A LEVEL PHYSICS",
  "GCSE MATHS",
  "GCSE BIOLOGY",
];

function TickerStrip({ stripId }: { stripId: string }) {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="ticker-strip" aria-hidden={stripId === "b"}>
      {items.map((item, index) => (
        <span key={`${stripId}-${item}-${index}`} className="ticker-item">
          ★ {item}
        </span>
      ))}
    </div>
  );
}

export default function Hero() {
  return (
    <section className="flex min-h-screen flex-col border-b-2 border-black bg-[#F2F0E4] font-sans">
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left — headline & CTAs */}
        <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-20">
          <h1 className="max-w-2xl text-[2rem] font-extrabold uppercase leading-[1.05] tracking-tight text-black sm:text-[2.75rem] lg:text-[3.25rem] xl:text-[3.75rem]">
            Pass the exam.
            <br />
            Not the guesswork.
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-relaxed text-black sm:text-base">
            GCSE and A Level Maths and Science practice — every question is free
            text, marked by AI for meaning rather than ticking boxes. You&apos;ll
            get the mark, the reasoning, and the model answer that would&apos;ve
            scored full marks, plus an AI assistant on hand whenever you&apos;re
            stuck, across Foundation and Higher tiers.
          </p>

          <p className="mt-4 max-w-xl text-xs font-semibold uppercase leading-relaxed text-[#DC2626] sm:text-sm">
            Every question written to the syllabus — but these are practice
            papers, not real exams.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center border-2 border-black bg-[#1D4ED8] px-6 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-[4px_4px_0_#000] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#000] sm:px-8 sm:text-sm"
            >
              Get started
            </Link>
            <Link
              href="/main/courses"
              className="inline-flex items-center justify-center border-2 border-black bg-white px-6 py-3 text-xs font-bold uppercase tracking-wide text-black shadow-[4px_4px_0_#000] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#000] sm:px-8 sm:text-sm"
            >
              See subjects &amp; pricing
            </Link>
          </div>
        </div>

        {/* Right — interactive quiz walkthrough */}
        <div className="flex flex-1 items-center justify-center border-t-2 border-black px-4 py-10 lg:border-t-0 lg:border-l-2 lg:px-8 lg:py-12">
          <HeroQuizWalkthrough />
        </div>
      </div>

      {/* Continuous auto-sliding subject strip */}
      <div className="ticker-viewport border-t-2 border-black bg-black py-3">
        <div className="ticker-track" aria-label="Featured subjects">
          <TickerStrip stripId="a" />
          <TickerStrip stripId="b" />
        </div>
      </div>
    </section>
  );
}
