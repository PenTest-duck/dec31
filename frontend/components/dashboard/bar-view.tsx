"use client";

import { DayData, VOTE_COLORS, getVoteCounts } from "@/lib/votes";

interface BarViewProps {
  days: DayData[];
}

export function BarView({ days }: BarViewProps) {
  const { closer, further, pending, future } = getVoteCounts(days);
  const total = days.length;

  const segments = [
    { value: closer, color: VOTE_COLORS.closer, label: "Closer" },
    { value: further, color: VOTE_COLORS.further, label: "Further" },
    { value: pending, color: VOTE_COLORS.pending, label: "Pending" },
    { value: future, color: VOTE_COLORS.future, label: "Future" },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-4">
      <div className="h-8 rounded-full overflow-hidden flex">
        {segments.map((segment, i) => (
          <div
            key={i}
            style={{
              backgroundColor: segment.color,
              width: `${(segment.value / total) * 100}%`,
            }}
            className="transition-all duration-300"
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-4 justify-center text-sm">
        {segments.map((segment, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-zinc-600 dark:text-zinc-400">
              {segment.label}: {segment.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
