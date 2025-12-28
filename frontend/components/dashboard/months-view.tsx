"use client";

import { DayData, VOTE_COLORS, getMonthData, getMonthName } from "@/lib/votes";

interface MonthsViewProps {
  days: DayData[];
}

export function MonthsView({ days }: MonthsViewProps) {
  const months = getMonthData(days);
  const monthEntries = Array.from(months.entries());

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
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
          <div
            key={monthKey}
            className="flex flex-col items-center space-y-2"
          >
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {getMonthName(monthKey)}
            </span>
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex flex-col"
              style={{ border: "1px solid rgba(0,0,0,0.1)" }}
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
  );
}
