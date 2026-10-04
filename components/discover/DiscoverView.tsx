"use client";

import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import DiscoverSidebar from "@/components/discover/DiscoverSidebar";
import GatheringCard from "@/components/discover/GatheringCard";
import {
  GATHERING_TABS,
  GATHERING_TYPES,
  filterGatherings,
  groupGatherings,
  sortGatherings,
  typeCounts,
  type DistanceFilter,
  type Gathering,
  type GatheringTabId,
  type GatheringTypeId,
} from "@/lib/gatherings";

const PAGE_SIZE = 12;

export default function DiscoverView({
  gatherings,
}: {
  gatherings: Gathering[];
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<GatheringTabId>("all");
  const [distance, setDistance] = useState<DistanceFilter>("nationwide");
  const [selectedTypes, setSelectedTypes] = useState<GatheringTypeId[]>(
    GATHERING_TYPES.map((type) => type.id)
  );
  const [sort, setSort] = useState<"date" | "distance">("date");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [saved, setSaved] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const counts = useMemo(() => typeCounts(gatherings), [gatherings]);

  const filtered = useMemo(() => {
    const next = sortGatherings(
      filterGatherings(gatherings, {
        query,
        tab,
        types: selectedTypes,
        distance,
      }),
      sort
    );
    return next;
  }, [gatherings, query, tab, selectedTypes, distance, sort]);

  const visibleItems = filtered.slice(0, visible);
  const groups = groupGatherings(visibleItems);
  const canLoadMore = visible < filtered.length;

  function toggleType(id: GatheringTypeId) {
    setVisible(PAGE_SIZE);
    setSelectedTypes((current) => {
      if (current.includes(id)) {
        const next = current.filter((type) => type !== id);
        return next.length === 0 ? current : next;
      }
      return [...current, id];
    });
  }

  const sidebar = (
    <DiscoverSidebar
      distance={distance}
      onDistanceChange={(value) => {
        setDistance(value);
        setVisible(PAGE_SIZE);
      }}
      selectedTypes={selectedTypes}
      onToggleType={toggleType}
      counts={counts}
    />
  );

  return (
    <div className="bg-white">
      <div className="w-full px-6 pb-6 pt-8 sm:px-10 sm:pt-10 lg:px-14">
        <p className="flex items-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[#a6342a]">
          <span className="h-px w-5 bg-[#a6342a]" />
          This season
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-[2.75rem] leading-none tracking-[-0.03em] text-[#1c2118]">
          Discover
        </h1>
      </div>

      <div className="flex items-start">
      <aside className="sticky top-0 hidden max-h-[calc(100dvh-var(--topbar-height,4.25rem))] w-[19.5rem] shrink-0 overflow-y-auto overscroll-contain lg:block">
        {sidebar}
      </aside>

      {filtersOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/25"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 h-full w-[min(20rem,88vw)] overflow-y-auto overscroll-contain bg-white shadow-xl">
            <div className="flex justify-end px-5 pt-5">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="text-[#1c2118]"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <section className="min-w-0 flex-1 pb-16">
        <div className="flex items-center gap-3 px-5 pt-2 sm:px-8 lg:px-10">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-[#1c2118] lg:hidden"
            aria-label="Open filters"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
          <label className="relative flex min-w-0 flex-1 items-center">
            <Search className="pointer-events-none absolute left-0 h-4 w-4 text-[#8c857c]" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              placeholder="Search"
              className="h-10 w-full border-0 bg-transparent pl-7 text-[1.05rem] text-[#1c2118] outline-none placeholder:text-[#8c857c]"
            />
          </label>
        </div>

        <div className="mt-6 flex gap-6 overflow-x-auto px-5 sm:px-8 lg:mt-8 lg:px-10">
          {GATHERING_TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  setVisible(PAGE_SIZE);
                }}
                className={`shrink-0 pb-2 text-[0.7rem] font-medium uppercase tracking-[0.14em] ${
                  active
                    ? "border-b border-[#1c2118] text-[#1c2118]"
                    : "border-b border-transparent text-[#8c857c] hover:text-[#1c2118]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="px-5 sm:px-8 lg:px-10">
          <div className="mt-8 flex items-center justify-between gap-4">
            <p className="text-[0.95rem] text-[#5c574f]">
              {filtered.length}{" "}
              {tab === "all"
                ? ""
                : `${GATHERING_TABS.find((item) => item.id === tab)?.label.toLowerCase()} `}
              gathering{filtered.length === 1 ? "" : "s"}
            </p>
            <label className="relative inline-flex items-center text-[0.9rem] text-[#5c574f]">
              <span className="mr-1">Sort by</span>
              <select
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value === "distance" ? "distance" : "date")
                }
                className="cursor-pointer appearance-none bg-transparent pr-5 font-medium text-[#1c2118] outline-none"
              >
                <option value="date">Date</option>
                <option value="distance">Distance</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 h-3.5 w-3.5" />
            </label>
          </div>

          {gatherings.length === 0 ? (
            <p className="mt-16 font-[family-name:var(--font-display)] text-xl text-[#8c857c]">
              No gatherings yet.
            </p>
          ) : groups.length === 0 ? (
            <p className="mt-16 font-[family-name:var(--font-display)] text-xl text-[#8c857c]">
              No gatherings match these filters.
            </p>
          ) : (
            groups.map((group) => (
              <section key={group.label} className="mt-10">
                <p className="flex items-center gap-3 text-[0.8rem] text-[#5c574f]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b8573a]" />
                  {group.label}
                  <span className="h-px flex-1 bg-[#ece8e2]" />
                </p>
                <div>
                  {group.items.map((gathering) => (
                    <GatheringCard
                      key={gathering.id}
                      gathering={gathering}
                      saved={saved.includes(gathering.id)}
                      onToggleSave={() =>
                        setSaved((current) =>
                          current.includes(gathering.id)
                            ? current.filter((id) => id !== gathering.id)
                            : [...current, gathering.id]
                        )
                      }
                    />
                  ))}
                </div>
              </section>
            ))
          )}

          {canLoadMore ? (
            <div className="flex justify-center pt-12">
              <button
                type="button"
                onClick={() => setVisible((count) => count + PAGE_SIZE)}
                className="rounded-full border border-[#1c2118] px-5 py-2.5 text-[0.85rem] text-[#1c2118] transition-colors hover:bg-[#1c2118] hover:text-white"
              >
                Load more gatherings
              </button>
            </div>
          ) : null}
        </div>
      </section>
      </div>
    </div>
  );
}
