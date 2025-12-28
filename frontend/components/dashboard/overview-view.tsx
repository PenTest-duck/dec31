"use client";

import { DayData, calculateCompoundScore, getVoteCounts } from "@/lib/votes";
import { DaysView } from "./days-view";

interface OverviewViewProps {
  days: DayData[];
  onDayClick: (date: string) => void;
}

export function OverviewView({ days, onDayClick }: OverviewViewProps) {
  const currentScore = calculateCompoundScore(days);
  const { closer, further, pending, future } = getVoteCounts(days);

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="grid grid-cols-5 gap-2 text-center shrink-0">
        <div className="px-2 py-2 border border-zinc-800 bg-zinc-900/30">
          <p className="text-[10px] text-zinc-500 uppercase">Score</p>
          <p className="text-xl font-bold text-white">{currentScore.toFixed(1)}</p>
        </div>
        <div className="px-2 py-2 border border-zinc-800 bg-zinc-900/30">
          <p className="text-[10px] text-zinc-500 uppercase">Closer</p>
          <p className="text-xl font-bold text-green-400">{closer}</p>
        </div>
        <div className="px-2 py-2 border border-zinc-800 bg-zinc-900/30">
          <p className="text-[10px] text-zinc-500 uppercase">Further</p>
          <p className="text-xl font-bold text-red-400">{further}</p>
        </div>
        <div className="px-2 py-2 border border-zinc-800 bg-zinc-900/30">
          <p className="text-[10px] text-zinc-500 uppercase">Pending</p>
          <p className="text-xl font-bold text-orange-400">{pending}</p>
        </div>
        <div className="px-2 py-2 border border-zinc-800 bg-zinc-900/30">
          <p className="text-[10px] text-zinc-500 uppercase">Future</p>
          <p className="text-xl font-bold text-zinc-500">{future}</p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <DaysView days={days} onDayClick={onDayClick} />
      </div>
    </div>
  );
}
