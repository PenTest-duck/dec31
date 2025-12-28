"use client";

import { DayData, VOTE_COLORS } from "@/lib/votes";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts";

interface GraphViewProps {
  days: DayData[];
}

export function GraphView({ days }: GraphViewProps) {
  let position = 0;
  const data: { date: string; value: number; vote: string | null }[] = [];

  for (const day of days) {
    if (day.isPast || day.isToday) {
      if (day.vote === "closer") {
        position += 1;
      } else if (day.vote === "further") {
        position -= 1;
      }
      data.push({
        date: day.date,
        value: position,
        vote: day.vote,
      });
    }
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 dark:text-zinc-400">
        No data yet. Start voting to see your progress.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString("en-US", { month: "short" });
            }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 shadow-lg">
                    <p className="text-xs text-zinc-500">
                      {new Date(data.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-medium">Score: {data.value}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#000"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
