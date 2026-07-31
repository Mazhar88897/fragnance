"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navButtonClass =
  "inline-flex items-center justify-center border-2 border-black px-4 py-2 text-xs font-bold uppercase tracking-wide shadow-[4px_4px_0_#000] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#000] sm:px-5 sm:text-sm";

export default function TopBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full border-b-2 border-black bg-white">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="inline-block h-3.5 w-3.5 shrink-0 bg-[#DC2626]"
            style={{ transform: "rotate(12deg)" }}
            aria-hidden
          />
          <span className="text-sm font-extrabold uppercase tracking-wide text-black sm:text-base">
            Grademark
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-3 sm:flex">
          <Link
            href="/"
            className={`${navButtonClass} bg-white text-black`}
          >
            Home
          </Link>
          <Link
            href="/auth/login"
            className={`${navButtonClass} bg-[#1D4ED8] text-white`}
          >
            Log in
          </Link>
        </nav>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white shadow-[3px_3px_0_#000] sm:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isOpen ? (
        <nav className="flex flex-col gap-3 border-t-2 border-black px-4 py-4 sm:hidden">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className={`${navButtonClass} w-full bg-white text-black`}
          >
            Home
          </Link>
          <Link
            href="/auth/login"
            onClick={() => setIsOpen(false)}
            className={`${navButtonClass} w-full bg-[#1D4ED8] text-white`}
          >
            Log in
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
