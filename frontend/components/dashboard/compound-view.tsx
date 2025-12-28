"use client";

import { DayData, calculateCompoundScore } from "@/lib/votes";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts";

interface CompoundViewProps {
  days: DayData[];
}

export function CompoundView({ days }: CompoundViewProps) {
  const currentScore = calculateCompoundScore(days);

  // Calculate historical data
  let score = 100;
  const historicalData: { date: string; value: number }[] = [];

  for (const day of days) {
    if (day.isPast || day.isToday) {
      if (day.vote === "closer") {
        score *= 1.01;
      } else if (day.vote === "further") {
        score *= 0.99;
      }
      historicalData.push({
        date: day.date,
        value: Math.round(score * 10) / 10,
      });
    }
  }

  // Calculate projections
  const remainingDays = days.filter((d) => !d.isPast && !d.isToday).length;
  const bestProjection = currentScore * Math.pow(1.01, remainingDays);
  const worstProjection = currentScore * Math.pow(0.99, remainingDays);

  // Generate projection data points
  const projectionData: {
    date: string;
    best: number;
    worst: number;
    actual?: number;
  }[] = [];

  if (historicalData.length > 0) {
    let bestScore = currentScore;
    let worstScore = currentScore;
    let i = 0;

    for (const day of days) {
      if (!day.isPast && !day.isToday) {
        bestScore *= 1.01;
        worstScore *= 0.99;

        if (i % 30 === 0 || i === remainingDays - 1) {
          projectionData.push({
            date: day.date,
            best: Math.round(bestScore * 10) / 10,
            worst: Math.round(worstScore * 10) / 10,
          });
        }
        i++;
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
          Current Compound Score
        </p>
        <p className="text-5xl font-bold tracking-tight text-black dark:text-white">
          {currentScore.toFixed(1)}
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          Started at 100 · 1% per day
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            If all remaining days are green
          </p>
          <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
            {bestProjection.toFixed(1)}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            If all remaining days are red
          </p>
          <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
            {worstProjection.toFixed(1)}
          </p>
        </div>
      </div>

      {historicalData.length > 0 && (
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historicalData}
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", { month: "short" });
                }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 shadow-lg">
                        <p className="text-xs text-zinc-500">
                          {new Date(data.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-medium">
                          Score: {data.value}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={100} stroke="#9ca3af" strokeDasharray="3 3" />
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
      )}
    </div>
  );
}
