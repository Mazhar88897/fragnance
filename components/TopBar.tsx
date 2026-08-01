"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/cabinet", label: "Cabinet" },
  { href: "/favourites", label: "Favourites" },
  { href: "/notes", label: "Notes" },
  { href: "/add-scent", label: "Add a scent" },
];

export default function TopBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  function linkClass(href: string) {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return `text-[0.7rem] font-medium uppercase tracking-[0.14em] transition-opacity lg:text-[0.75rem] ${
      active
        ? "text-black"
        : "text-[#3a3a3a] hover:opacity-60"
    }`;
  }

  return (
    <header className="w-full border-b border-[#3a3a3a] bg-white">
      <div className="mx-auto flex h-[4.25rem] max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="text-[0.95rem] font-medium uppercase tracking-[0.12em] text-[#3a3a3a] sm:text-[1.05rem]"
        >
          Mister Fragrant
        </Link>

        <nav className="hidden items-center gap-8 md:flex lg:gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.href)}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center text-[#3a3a3a] md:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen ? (
        <nav className="flex flex-col gap-4 border-t border-[#3a3a3a] px-5 py-5 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={linkClass(link.href)}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
