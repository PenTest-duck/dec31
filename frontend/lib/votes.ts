export type VoteType = "closer" | "further" | null;

export interface DayData {
  date: string;
  vote: VoteType;
  isPast: boolean;
  isToday: boolean;
}

export const VOTE_COLORS = {
  closer: "#22c55e",
  further: "#ef4444",
  pending: "#f97316",
  future: "#9ca3af",
} as const;

const currentYear = new Date().getFullYear();
export const START_DATE = new Date(`${currentYear}-01-01`);
export const END_DATE = new Date(`${currentYear}-12-31`);

export function getDaysInRange(
  startDate: Date,
  endDate: Date,
  votes: Map<string, VoteType>
): DayData[] {
  const days: DayData[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];
    const currentTime = current.getTime();
    const todayTime = today.getTime();

    days.push({
      date: dateStr,
      vote: votes.get(dateStr) || null,
      isPast: currentTime < todayTime,
      isToday: currentTime === todayTime,
    });

    current.setDate(current.getDate() + 1);
  }

  return days;
}

export function getMonthData(days: DayData[]) {
  const months: Map<string, DayData[]> = new Map();

  for (const day of days) {
    const monthKey = day.date.substring(0, 7); // YYYY-MM
    if (!months.has(monthKey)) {
      months.set(monthKey, []);
    }
    months.get(monthKey)!.push(day);
  }

  return months;
}

export function calculateCompoundScore(days: DayData[]): number {
  let score = 100;

  for (const day of days) {
    if (day.isPast || day.isToday) {
      if (day.vote === "closer") {
        score *= 1.01;
      } else if (day.vote === "further") {
        score *= 0.99;
      }
    }
  }

  return Math.round(score * 10) / 10;
}

export function getVoteCounts(days: DayData[]) {
  let closer = 0;
  let further = 0;
  let pending = 0;
  let future = 0;

  for (const day of days) {
    if (!day.isPast && !day.isToday) {
      future++;
    } else if (day.vote === "closer") {
      closer++;
    } else if (day.vote === "further") {
      further++;
    } else {
      pending++;
    }
  }

  return { closer, further, pending, future };
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getMonthName(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short" });
}
