"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HtmlEditor, { htmlIsEmpty } from "@/components/admin/HtmlEditor";
import { GATHERING_TYPES } from "@/lib/gatherings";
import type { PublicGathering } from "@/lib/gathering-posts";

const fieldClass =
  "mt-3 w-full border-0 border-b border-[#cfc8bf] bg-transparent pb-2 text-[1rem] text-[#1c2118] outline-none focus:border-[#1c2118]";

type SpeakerRow = { speaker_name: string; role: string };

function toLocalInput(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function GatheringForm({
  gatheringId,
  asAdmin = false,
}: {
  gatheringId?: string;
  asAdmin?: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [typeId, setTypeId] = useState<string>(GATHERING_TYPES[0].id);
  const [datetime, setDatetime] = useState("");
  const [location, setLocation] = useState("");
  const [locationLink, setLocationLink] = useState("");
  const [booking, setBooking] = useState("");
  const [attendance, setAttendance] = useState("");
  const [about, setAbout] = useState("");
  const [photos, setPhotos] = useState<string[]>([""]);
  const [speakers, setSpeakers] = useState<SpeakerRow[]>([
    { speaker_name: "", role: "" },
  ]);
  const [extras, setExtras] = useState<Record<string, unknown>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(!gatheringId);

  useEffect(() => {
    if (!gatheringId) return;

    fetch(asAdmin ? `/api/admin/gatherings/${gatheringId}` : `/api/gatherings/${gatheringId}`)
      .then(async (res) => {
        const json = (await res.json()) as {
          ok?: boolean;
          gathering?: PublicGathering;
          message?: string;
        };
        if (!res.ok || !json.gathering) {
          throw new Error(json.message ?? "Gathering not found.");
        }
        const item = json.gathering;
        setTitle(item.title);
        setTypeId(item.type_id);
        setDatetime(toLocalInput(item.datetime));
        setLocation(item.location);
        setLocationLink(item.location_link);
        setBooking(item.booking);
        setAttendance(item.attendance);
        setAbout(item.about);
        setPhotos(item.gathering_photos.length ? item.gathering_photos : [""]);
        setSpeakers(
          item.speakers.length
            ? item.speakers
            : [{ speaker_name: "", role: "" }]
        );
        setExtras(item.extras ?? {});
        setReady(true);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not load gathering.");
      });
  }, [asAdmin, gatheringId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      if (htmlIsEmpty(about)) {
        setError("About is required.");
        return;
      }

      const payload = {
        title,
        type_id: typeId,
        datetime: new Date(datetime).toISOString(),
        location,
        location_link: locationLink,
        booking,
        attendance,
        about,
        gathering_photos: photos,
        speakers,
        extras,
      };

      const path = asAdmin
        ? gatheringId
          ? `/api/admin/gatherings/${gatheringId}`
          : "/api/admin/gatherings"
        : gatheringId
          ? `/api/gatherings/${gatheringId}`
          : "/api/gatherings";

      const res = await fetch(path, {
        method: gatheringId ? (asAdmin ? "PUT" : "PATCH") : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setError(json.message ?? "Could not save gathering.");
        return;
      }
      router.push(asAdmin ? "/admin/gatherings" : "/dashboard");
      router.refresh();
    } catch {
      setError("Could not save gathering.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready && !error) {
    return (
      <main className="bg-white px-6 py-20">
        <p className="text-[#8c857c]">Loading…</p>
      </main>
    );
  }

  return (
    <main className="bg-white px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
      <div className="mx-auto w-full max-w-7xl">
        <p className="flex items-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[#a6342a]">
          <span className="h-px w-5 bg-[#a6342a]" />
          {asAdmin ? "Admin" : "Organisation account"}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[2.5rem] leading-none tracking-[-0.03em] text-[#1c2118]">
          {gatheringId ? "Edit gathering" : "Add a gathering"}
        </h1>
        {asAdmin && !gatheringId ? (
          <p className="mt-3 text-[0.95rem] text-[#6b6560]">
            This gathering will be published as approved.
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-12">
          <div className="max-w-[40rem]">
          <label className="block">
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#8c857c]">
              Title
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={fieldClass}
            />
          </label>

          <label className="mt-8 block">
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#8c857c]">
              Type
            </span>
            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              className={`${fieldClass} bg-white`}
            >
              {GATHERING_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-8 block">
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#8c857c]">
              Date / time
            </span>
            <input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              required
              className={fieldClass}
            />
          </label>

          <label className="mt-8 block">
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#8c857c]">
              Location
            </span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className={fieldClass}
            />
          </label>

          <label className="mt-8 block">
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#8c857c]">
              Location link
            </span>
            <input
              value={locationLink}
              onChange={(e) => setLocationLink(e.target.value)}
              placeholder="https://"
              className={fieldClass}
            />
          </label>

          <label className="mt-8 block">
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#8c857c]">
              Booking
            </span>
            <input
              value={booking}
              onChange={(e) => setBooking(e.target.value)}
              placeholder="Link or booking notes"
              className={fieldClass}
            />
          </label>

          <label className="mt-8 block">
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#8c857c]">
              Attendance
            </span>
            <input
              value={attendance}
              onChange={(e) => setAttendance(e.target.value)}
              placeholder="e.g. 80 or Open"
              className={fieldClass}
            />
          </label>

          </div>

          <div className="mt-8">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#8c857c]">
              About
            </p>
            <div className="mt-3">
              <HtmlEditor
                value={about}
                onChange={setAbout}
                placeholder="Describe the gathering…"
                minHeight="280px"
              />
            </div>
          </div>

          <div className="mt-8 max-w-[40rem]">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#8c857c]">
              Gathering photos
            </p>
            {photos.map((photo, index) => (
              <input
                key={index}
                value={photo}
                onChange={(e) =>
                  setPhotos((current) =>
                    current.map((item, i) =>
                      i === index ? e.target.value : item
                    )
                  )
                }
                placeholder="https://"
                className={fieldClass}
              />
            ))}
            <button
              type="button"
              onClick={() => setPhotos((current) => [...current, ""])}
              className="mt-3 text-[0.85rem] text-[#1c2118] underline underline-offset-4"
            >
              Add another photo
            </button>
          </div>

          <div className="mt-8 max-w-[40rem]">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#8c857c]">
              Speakers
            </p>
            {speakers.map((speaker, index) => (
              <div key={index} className="grid grid-cols-2 gap-4">
                <input
                  value={speaker.speaker_name}
                  onChange={(e) =>
                    setSpeakers((current) =>
                      current.map((item, i) =>
                        i === index
                          ? { ...item, speaker_name: e.target.value }
                          : item
                      )
                    )
                  }
                  placeholder="Speaker name"
                  className={fieldClass}
                />
                <input
                  value={speaker.role}
                  onChange={(e) =>
                    setSpeakers((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, role: e.target.value } : item
                      )
                    )
                  }
                  placeholder="Role"
                  className={fieldClass}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setSpeakers((current) => [
                  ...current,
                  { speaker_name: "", role: "" },
                ])
              }
              className="mt-3 text-[0.85rem] text-[#1c2118] underline underline-offset-4"
            >
              Add another speaker
            </button>
          </div>

          {error ? (
            <p className="mt-6 max-w-[40rem] text-[0.85rem] text-[#b8573a]">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="mt-10 w-full max-w-[40rem] rounded-full bg-black py-3.5 text-[0.9rem] font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {busy ? "Saving…" : gatheringId ? "Save gathering" : "Post gathering"}
          </button>
        </form>

        <Link
          href={asAdmin ? "/admin/gatherings" : "/dashboard"}
          className="mt-8 inline-block text-[0.9rem] text-[#1c2118] transition-opacity hover:opacity-60"
        >
          {asAdmin ? "Back to gatherings" : "Back to dashboard"}
        </Link>
      </div>
    </main>
  );
}
