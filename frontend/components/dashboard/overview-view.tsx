"use client";

import { useRef, useCallback } from "react";
import html2canvas from "html2canvas-pro";
import { Download } from "lucide-react";
import { DayData, calculateCompoundScore, getVoteCounts } from "@/lib/votes";
import { DaysView } from "./days-view";
import { Button } from "@/components/ui/button";

interface OverviewViewProps {
  days: DayData[];
  onDayClick: (date: string) => void;
}

export function OverviewView({ days, onDayClick }: OverviewViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentScore = calculateCompoundScore(days);
  const { closer, further, pending, future } = getVoteCounts(days);

  const handleDownload = useCallback(async () => {
    if (!containerRef.current) return;

    const WIDTH = 2560;
    const HEIGHT = 1600;

    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const capturedCanvas = await html2canvas(containerRef.current, {
      backgroundColor: "#09090b",
      scale: 2,
      useCORS: true,
    });

    const contentWidth = capturedCanvas.width;
    const contentHeight = capturedCanvas.height;
    const scale = Math.min(
      (WIDTH * 0.8) / contentWidth,
      (HEIGHT * 0.8) / contentHeight
    );
    const scaledWidth = contentWidth * scale;
    const scaledHeight = contentHeight * scale;
    const x = (WIDTH - scaledWidth) / 2;
    const y = (HEIGHT - scaledHeight) / 2;

    ctx.drawImage(capturedCanvas, x, y, scaledWidth, scaledHeight);

    const link = document.createElement("a");
    link.download = `dec31-dashboard-${new Date().toISOString().split("T")[0]}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  return (
    <div className="h-full flex flex-col gap-4 relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDownload}
        className="absolute top-0 right-0 h-6 w-6 text-zinc-600 hover:text-white z-10"
        title="Download as wallpaper"
      >
        <Download className="h-3 w-3" />
      </Button>

      <div ref={containerRef} className="h-full flex flex-col gap-4">
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
    </div>
  );
}
