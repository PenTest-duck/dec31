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

type CellData = DayData | null;

export function DaysView({ days, onDayClick }: DaysViewProps) {
  // Group days by year-month and normalize to 42 cells (6 rows × 7 cols)
  const monthGroups: { month: string; year: string; cells: CellData[] }[] = [];
  let currentMonth = "";
  let currentDays: DayData[] = [];

  const finalizeMonth = () => {
    if (currentDays.length === 0) return;
    
    const firstDay = currentDays[0];
    const [year, month] = firstDay.date.substring(0, 7).split("-");
    
    // Get day of week for first day (0 = Sunday)
    const firstDate = new Date(firstDay.date);
    const startDayOfWeek = firstDate.getDay();
    
    // Create 42-cell grid (6 rows × 7 cols)
    const cells: CellData[] = [];
    
    // Add empty cells before first day
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push(null);
    }
    
    // Add actual days
    for (const day of currentDays) {
      cells.push(day);
    }
    
    // Pad to exactly 42 cells
    while (cells.length < 42) {
      cells.push(null);
    }
    
    monthGroups.push({ month, year, cells });
  };

  for (const day of days) {
    const monthKey = day.date.substring(0, 7);
    if (monthKey !== currentMonth) {
      finalizeMonth();
      currentMonth = monthKey;
      currentDays = [];
    }
    currentDays.push(day);
  }
  finalizeMonth();

  const getColor = (day: DayData) => {
    if (!day.isPast && !day.isToday) return VOTE_COLORS.future;
    if (day.vote === "closer") return VOTE_COLORS.closer;
    if (day.vote === "further") return VOTE_COLORS.further;
    return VOTE_COLORS.pending;
  };

  const canVote = (day: DayData) => {
    return day.isPast || day.isToday;
  };

  // Fixed 6 rows per month ensures uniform cell sizes
  // Aspect ratio: 4 cols × 7 cells / 3 rows × 6 cells = 28/18 ≈ 1.56 for desktop
  const GAP = 1; // gap in pixels
  
  return (
    <TooltipProvider delayDuration={100}>
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <div 
          className="h-full max-h-full max-w-full grid grid-cols-2 sm:grid-cols-4 aspect-[7/18] sm:aspect-[14/9]"
          style={{ gap: `${GAP * 3}px` }}
        >
          {monthGroups.map((group) => (
            <div key={`${group.year}-${group.month}`} className="flex flex-col min-w-0 min-h-0" style={{ gap: `${GAP}px` }}>
              <h3 className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide shrink-0">
                {getMonthName(`${group.year}-${group.month}`)} {group.year.slice(2)}
              </h3>
              <div 
                className="flex-1 grid grid-cols-7 grid-rows-6 min-h-0"
                style={{ gap: `${GAP}px` }}
              >
                {group.cells.map((cell, idx) => (
                  cell ? (
                    <Tooltip key={cell.date}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => canVote(cell) && onDayClick(cell.date)}
                          disabled={!canVote(cell)}
                          className={`w-full h-full transition-all ${
                            canVote(cell) ? "cursor-pointer hover:opacity-70" : "cursor-default"
                          } ${cell.isToday ? "ring-1 ring-white" : ""}`}
                          style={{ backgroundColor: getColor(cell) }}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-900 border-zinc-800 text-xs">
                        <p className="text-white">{formatDate(cell.date)}</p>
                        {cell.vote && <p className="text-zinc-400 capitalize">{cell.vote}</p>}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div key={`empty-${idx}`} className="w-full h-full" />
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
