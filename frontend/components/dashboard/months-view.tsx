"use client";

import { DayData, VOTE_COLORS, getMonthData, getMonthName } from "@/lib/votes";

interface MonthsViewProps {
  days: DayData[];
}

export function MonthsView({ days }: MonthsViewProps) {
  const months = getMonthData(days);
  const monthEntries = Array.from(months.entries());

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden p-2">
      <div 
        className="h-full max-h-full max-w-full grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1 aspect-[1/2] sm:aspect-[4/3]"
      >
        {monthEntries.map(([monthKey, monthDays]) => {
        const closer = monthDays.filter((d) => d.vote === "closer").length;
        const further = monthDays.filter((d) => d.vote === "further").length;
        const pending = monthDays.filter(
          (d) => (d.isPast || d.isToday) && !d.vote
        ).length;
        const future = monthDays.filter(
          (d) => !d.isPast && !d.isToday
        ).length;
        const total = monthDays.length;

        return (
          <div key={monthKey} className="flex flex-col items-center gap-1 min-w-0 min-h-0">
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide shrink-0">
              {getMonthName(monthKey)} {monthKey.split("-")[0].slice(2)}
            </span>
            <div
              className="w-full flex-1 min-h-0 aspect-square flex flex-col border border-zinc-800"
            >
              {closer > 0 && (
                <div
                  style={{
                    backgroundColor: VOTE_COLORS.closer,
                    height: `${(closer / total) * 100}%`,
                  }}
                />
              )}
              {further > 0 && (
                <div
                  style={{
                    backgroundColor: VOTE_COLORS.further,
                    height: `${(further / total) * 100}%`,
                  }}
                />
              )}
              {pending > 0 && (
                <div
                  style={{
                    backgroundColor: VOTE_COLORS.pending,
                    height: `${(pending / total) * 100}%`,
                  }}
                />
              )}
              {future > 0 && (
                <div
                  style={{
                    backgroundColor: VOTE_COLORS.future,
                    height: `${(future / total) * 100}%`,
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
