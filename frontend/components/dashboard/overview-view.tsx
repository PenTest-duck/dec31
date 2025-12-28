"use client";

import { DayData } from "@/lib/votes";
import { DaysView } from "./days-view";
import { MonthsView } from "./months-view";
import { BarView } from "./bar-view";
import { GraphView } from "./graph-view";
import { CompoundView } from "./compound-view";

interface OverviewViewProps {
  days: DayData[];
  onDayClick: (date: string) => void;
}

export function OverviewView({ days, onDayClick }: OverviewViewProps) {
  return (
    <div className="space-y-12">
      <section>
        <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">
          Compound Score
        </h3>
        <CompoundView days={days} />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">
          Progress Bar
        </h3>
        <BarView days={days} />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">
          Trajectory
        </h3>
        <GraphView days={days} />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">
          Monthly Overview
        </h3>
        <MonthsView days={days} />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">
          Daily Progress
        </h3>
        <DaysView days={days} onDayClick={onDayClick} />
      </section>
    </div>
  );
}
