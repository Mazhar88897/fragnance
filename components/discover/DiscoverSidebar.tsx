import {
  GATHERING_TYPES,
  type DistanceFilter,
  type GatheringTypeId,
} from "@/lib/gatherings";

const DISTANCES: { value: DistanceFilter; label: string }[] = [
  { value: 10, label: "Within 10 miles" },
  { value: 25, label: "Within 25 miles" },
  { value: "nationwide", label: "Nationwide" },
];

type DiscoverSidebarProps = {
  distance: DistanceFilter;
  onDistanceChange: (value: DistanceFilter) => void;
  selectedTypes: GatheringTypeId[];
  onToggleType: (id: GatheringTypeId) => void;
  counts: Record<GatheringTypeId, number>;
};

export default function DiscoverSidebar({
  distance,
  onDistanceChange,
  selectedTypes,
  onToggleType,
  counts,
}: DiscoverSidebarProps) {
  return (
    <div className="px-6 pb-16 pt-2 sm:px-8 lg:px-10">
      <section>
        <h2 className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[#8c857c]">
          Location
        </h2>
        <p className="mt-4 inline-block border-b border-[#1c2118] pb-1 font-[family-name:var(--font-display)] text-[1.05rem] leading-none text-[#1c2118]">
          Near me
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[#8c857c]">
          Distance
        </h2>
        <div className="mt-4 flex flex-col gap-3.5">
          {DISTANCES.map((option) => {
            const checked = distance === option.value;
            return (
              <label
                key={String(option.value)}
                className="flex cursor-pointer items-center gap-3 text-[0.95rem] text-[#1c2118]"
              >
                <span
                  className={`flex h-[1.05rem] w-[1.05rem] items-center justify-center rounded-full border ${
                    checked ? "border-[#1c2118]" : "border-[#b9b3ab]"
                  }`}
                >
                  {checked ? (
                    <span className="h-2 w-2 rounded-full bg-[#1c2118]" />
                  ) : null}
                </span>
                <input
                  type="radio"
                  name="distance"
                  className="sr-only"
                  checked={checked}
                  onChange={() => onDistanceChange(option.value)}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[#8c857c]">
          Type
        </h2>
        <div className="mt-4 flex flex-col gap-3.5">
          {GATHERING_TYPES.map((type) => {
            const checked = selectedTypes.includes(type.id);
            return (
              <label
                key={type.id}
                className="flex cursor-pointer items-center justify-between gap-4 text-[0.95rem] text-[#1c2118]"
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`flex h-[1.05rem] w-[1.05rem] items-center justify-center rounded-[3px] border ${
                      checked
                        ? "border-[#1c2118] bg-[#1c2118] text-white"
                        : "border-[#b9b3ab] bg-white"
                    }`}
                  >
                    {checked ? (
                      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden>
                        <path
                          d="M2.2 6.1 4.7 8.6 9.8 3.4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => onToggleType(type.id)}
                  />
                  {type.label}
                </span>
                <span className="text-[0.8rem] text-[#8c857c]">
                  {counts[type.id]}
                </span>
              </label>
            );
          })}
        </div>
      </section>
    </div>
  );
}
