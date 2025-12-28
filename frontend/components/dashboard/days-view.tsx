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
  // Group days by month for display
  const monthGroups: { month: string; days: DayData[] }[] = [];
  let currentMonth = "";

  for (const day of days) {
    const monthKey = day.date.substring(0, 7);
    if (monthKey !== currentMonth) {
      currentMonth = monthKey;
      monthGroups.push({ month: monthKey, days: [] });
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
    return (day.isPast || day.isToday) && !day.vote;
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {monthGroups.map((group) => (
          <div key={group.month} className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {getMonthName(group.month)} {group.month.split("-")[0]}
            </h3>
            <div className="flex flex-wrap gap-1">
              {group.days.map((day) => (
                <Tooltip key={day.date}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => canVote(day) && onDayClick(day.date)}
                      disabled={!canVote(day)}
                      className={`w-4 h-4 rounded-sm transition-all ${
                        canVote(day)
                          ? "cursor-pointer hover:scale-125 hover:ring-2 hover:ring-offset-1 hover:ring-black dark:hover:ring-white"
                          : "cursor-default"
                      } ${day.isToday ? "ring-2 ring-black dark:ring-white" : ""}`}
                      style={{ backgroundColor: getColor(day) }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{formatDate(day.date)}</p>
                    {day.vote && (
                      <p className="text-xs opacity-75 capitalize">{day.vote}</p>
                    )}
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
