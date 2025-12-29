"use client";

import { DayData, VOTE_COLORS, formatDate, getMonthName } from "@/lib/votes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DaysViewProps {
  days: DayData[];
  onDayClick: (date: string) => void;
}

export function DaysView({ days, onDayClick }: DaysViewProps) {
  // Group days by year-month for display
  const monthGroups: { month: string; year: string; days: DayData[] }[] = [];
  let currentMonth = "";

  for (const day of days) {
    const monthKey = day.date.substring(0, 7);
    if (monthKey !== currentMonth) {
      currentMonth = monthKey;
      const [year, month] = monthKey.split("-");
      monthGroups.push({ month, year, days: [] });
    }
    monthGroups[monthGroups.length - 1].days.push(day);
  }

  const getColor = (day: DayData) => {
    if (!day.isPast && !day.isToday) return VOTE_COLORS.future;
    if (day.vote === "closer") return VOTE_COLORS.closer;
    if (day.vote === "further") return VOTE_COLORS.further;
    return VOTE_COLORS.pending;
  };

  const canVote = (day: DayData) => {
    return day.isPast || day.isToday;
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="h-full w-full grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2 auto-rows-fr">
        {monthGroups.map((group) => (
          <div key={`${group.year}-${group.month}`} className="space-y-1">
            <h3 className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
              {getMonthName(`${group.year}-${group.month}`)} {group.year.slice(2)}
            </h3>
            <div className="grid grid-cols-7 gap-0.5">
              {group.days.map((day) => (
                <Tooltip key={day.date}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => canVote(day) && onDayClick(day.date)}
                      disabled={!canVote(day)}
                      className={`w-full aspect-square transition-all ${
                        canVote(day) ? "cursor-pointer hover:opacity-70" : "cursor-default"
                      } ${day.isToday ? "ring-1 ring-white" : ""}`}
                      style={{ backgroundColor: getColor(day) }}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-900 border-zinc-800 text-xs">
                    <p className="text-white">{formatDate(day.date)}</p>
                    {day.vote && <p className="text-zinc-400 capitalize">{day.vote}</p>}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
