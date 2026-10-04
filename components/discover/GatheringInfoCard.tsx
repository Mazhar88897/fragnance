"use client";

import {
  Calendar,
  CircleCheck,
  Link2,
  MapPin,
  Share2,
  UserRound,
} from "lucide-react";
import { useState, type ReactNode } from "react";

function formatWhen(value: string) {
  const date = new Date(value);
  const day = date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const time = date
    .toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/\s/g, "")
    .toLowerCase();
  return `${day} · ${time}`;
}

function icsStamp(date: Date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function asHref(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[\w.-]+\.[a-z]{2,}([/?#].*)?$/i.test(value)) return `https://${value}`;
  return null;
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-[#f0ece6] py-[1.35rem] last:border-b-0">
      <p className="flex items-center gap-2.5 text-[0.64rem] font-medium uppercase tracking-[0.18em] text-[#9a948c]">
        <span className="text-[#a6342a]">{icon}</span>
        {label}
      </p>
      <div className="mt-2 pl-7 text-[0.98rem] leading-[1.55] text-[#1c2118]">
        {children}
      </div>
    </div>
  );
}

type GatheringInfoCardProps = {
  title: string;
  datetime: string;
  location: string;
  locationLink: string;
  host: string;
  verified: boolean;
  attendance: string;
  booking: string;
};

export default function GatheringInfoCard({
  title,
  datetime,
  location,
  locationLink,
  host,
  verified,
  attendance,
  booking,
}: GatheringInfoCardProps) {
  const [copied, setCopied] = useState(false);
  const locationHref = asHref(locationLink);
  const bookingHref = asHref(booking);

  function addToCalendar() {
    const start = new Date(datetime);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Majlis//Gathering//EN",
      "BEGIN:VEVENT",
      `DTSTAMP:${icsStamp(new Date())}`,
      `DTSTART:${icsStamp(start)}`,
      `DTEND:${icsStamp(end)}`,
      `SUMMARY:${title.replace(/\n/g, " ")}`,
      `LOCATION:${location.replace(/\n/g, " ")}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/[^\w]+/g, "-").replace(/^-|-$/g, "") || "gathering"}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-[1.15rem] border border-[#efeae3] bg-white px-7 py-7 shadow-[0_22px_55px_rgba(28,33,24,0.08)]">
      <InfoRow icon={<Calendar className="h-4 w-4" strokeWidth={1.75} />} label="Date & time">
        {formatWhen(datetime)}
      </InfoRow>

      <InfoRow icon={<MapPin className="h-4 w-4" strokeWidth={1.75} />} label="Location">
        <p>{location}</p>
        {locationHref ? (
          <a
            href={locationHref}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-[0.95rem] text-[#a6342a] underline decoration-[#a6342a]/35 underline-offset-[5px] hover:opacity-70"
          >
            View location
          </a>
        ) : null}
      </InfoRow>

      <InfoRow icon={<UserRound className="h-4 w-4" strokeWidth={1.75} />} label="Organiser">
        {host}
        {verified ? ", Verified" : ""}
      </InfoRow>

      {attendance ? (
        <InfoRow
          icon={<CircleCheck className="h-4 w-4" strokeWidth={1.75} />}
          label="Attendance"
        >
          {attendance}
        </InfoRow>
      ) : null}

      {booking ? (
        <InfoRow icon={<Link2 className="h-4 w-4" strokeWidth={1.75} />} label="Booking or website">
          {bookingHref ? (
            <a
              href={bookingHref}
              target="_blank"
              rel="noreferrer"
              className="break-words underline decoration-[#1c2118]/18 underline-offset-[5px] hover:opacity-70"
            >
              {booking.replace(/^https?:\/\//, "")}
            </a>
          ) : (
            booking
          )}
        </InfoRow>
      ) : null}

      <div className="pt-5">
        <button
          type="button"
          onClick={addToCalendar}
          className="w-full rounded-md bg-[#1c2118] px-4 py-3.5 text-[0.95rem] font-medium text-white transition-opacity hover:opacity-85"
        >
          Add to calendar
        </button>
        <button
          type="button"
          onClick={() => void share()}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#e4dfd8] px-4 py-3.5 text-[0.95rem] text-[#1c2118] transition-colors hover:border-[#1c2118]"
        >
          <Share2 className="h-4 w-4" strokeWidth={1.75} />
          {copied ? "Link copied" : "Share"}
        </button>
      </div>
    </div>
  );
}
