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
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface CompoundViewProps {
  days: DayData[];
}

export function CompoundView({ days }: CompoundViewProps) {
  const currentScore = calculateCompoundScore(days);
  const [showSP500, setShowSP500] = useState(false);

  // Calculate historical data
  let score = 100;
  const historicalData: { date: string; value: number; sp500?: number }[] = [];

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

  // Add S&P 500 data to historical data
  if (showSP500 && historicalData.length > 0) {
    let sp500Score = 100;
    historicalData.forEach((data) => {
      sp500Score *= 1.00026116;
      data.sp500 = Math.round(sp500Score * 10) / 10;
    });
  }

  // Calculate projections
  const remainingDays = days.filter((d) => !d.isPast && !d.isToday).length;
  const bestProjection = currentScore * Math.pow(1.01, remainingDays);
  const worstProjection = currentScore * Math.pow(0.99, remainingDays);

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="text-center shrink-0">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">
          Compound Score
        </p>
        <p className="text-4xl font-bold tracking-tight text-white">
          {currentScore.toFixed(1)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center shrink-0">
        <div className="px-3 py-2 border border-green-900/50 bg-green-950/20">
          <p className="text-[10px] text-zinc-500 mb-0.5">Best case</p>
          <p className="text-lg font-semibold text-green-400">
            {bestProjection.toFixed(1)}
          </p>
        </div>
        <div className="px-3 py-2 border border-red-900/50 bg-red-950/20">
          <p className="text-[10px] text-zinc-500 mb-0.5">Worst case</p>
          <p className="text-lg font-semibold text-red-400">
            {worstProjection.toFixed(1)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 shrink-0">
        <Switch
          checked={showSP500}
          onCheckedChange={setShowSP500}
        />
        <label className="text-[10px] text-zinc-500 uppercase tracking-wide">
          Show S&P 500
        </label>
      </div>

      {historicalData.length > 0 && (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historicalData}
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            >
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
                domain={["auto", "auto"]}
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
                        <p className="text-xs font-medium text-white">
                          Score: {data.value}
                        </p>
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
              {showSP500 && (
                <Line
                  type="monotone"
                  dataKey="sp500"
                  stroke="#71717a"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
