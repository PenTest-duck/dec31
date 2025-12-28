"use client";

import { DayData } from "@/lib/votes";
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
  let score = 100;
  const data: { date: string; value: number; vote: string | null }[] = [];

  for (const day of days) {
    if (day.isPast || day.isToday) {
      if (day.vote === "closer") {
        score *= 1.01;
      } else if (day.vote === "further") {
        score *= 0.99;
      }
      data.push({
        date: day.date,
        value: Math.round(score * 10) / 10,
        vote: day.vote,
      });
    }
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
        No data yet. Start voting to see your progress.
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: "#71717a" }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString("en-US", { month: "short" });
            }}
            interval="preserveStartEnd"
            axisLine={{ stroke: "#27272a" }}
            tickLine={{ stroke: "#27272a" }}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "#71717a" }}
            axisLine={{ stroke: "#27272a" }}
            tickLine={{ stroke: "#27272a" }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-zinc-900 border border-zinc-800 p-2">
                    <p className="text-[10px] text-zinc-500">
                      {new Date(data.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs font-medium text-white">Score: {data.value}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine y={100} stroke="#3f3f46" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#fff"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
