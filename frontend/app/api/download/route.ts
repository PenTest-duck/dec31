import { NextResponse } from "next/server";
import { createCanvas } from "canvas";
import { createClient } from "@supabase/supabase-js";
import {
  DayData,
  VoteType,
  getDaysInRange,
  calculateCompoundScore,
  getVoteCounts,
  START_DATE,
  END_DATE,
  VOTE_COLORS,
  getMonthName,
} from "@/lib/votes";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }

  const apiKey = authHeader.substring(7);

  if (!apiKey) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }

  // Look up user by API key
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("id, name, identity_statement")
    .eq("api_key", apiKey)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  // Fetch user's votes
  const { data: votesData } = await supabaseAdmin
    .from("votes")
    .select("date, vote")
    .eq("user_id", user.id);

  const votesMap = new Map<string, VoteType>();
  if (votesData) {
    for (const vote of votesData) {
      votesMap.set(vote.date, vote.vote as VoteType);
    }
  }

  // Calculate days data
  const days = getDaysInRange(START_DATE, END_DATE, votesMap);
  const currentScore = calculateCompoundScore(days);
  const { closer, further, pending, future } = getVoteCounts(days);

  // Generate the image
  const WIDTH = 2560;
  const HEIGHT = 1600;

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#09090b";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Padding and layout
  const padding = 80;
  const contentWidth = WIDTH - padding * 2;

  // Draw title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 48px Arial, sans-serif";
  ctx.fillText("dec31", padding, padding + 40);

  // Draw identity statement if exists
  if (user.identity_statement) {
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "24px Arial, sans-serif";
    const identityY = padding + 90;
    const maxWidth = contentWidth - 200;
    const words = user.identity_statement.split(" ");
    let line = "";
    let y = identityY;
    
    for (const word of words) {
      const testLine = line + word + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== "") {
        ctx.fillText(line.trim(), padding, y);
        line = word + " ";
        y += 32;
        if (y > identityY + 64) break; // Limit to 3 lines
      } else {
        line = testLine;
      }
    }
    if (line && y <= identityY + 64) {
      ctx.fillText(line.trim(), padding, y);
    }
  }

  // Stats section
  const statsY = padding + 180;
  const statsHeight = 100;
  const statsGap = 20;
  const statWidth = (contentWidth - statsGap * 4) / 5;

  const stats = [
    { label: "SCORE", value: currentScore.toFixed(1), color: "#ffffff" },
    { label: "CLOSER", value: closer.toString(), color: VOTE_COLORS.closer },
    { label: "FURTHER", value: further.toString(), color: VOTE_COLORS.further },
    { label: "PENDING", value: pending.toString(), color: VOTE_COLORS.pending },
    { label: "FUTURE", value: future.toString(), color: VOTE_COLORS.future },
  ];

  stats.forEach((stat, i) => {
    const x = padding + i * (statWidth + statsGap);

    // Box
    ctx.strokeStyle = "#27272a";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, statsY, statWidth, statsHeight);
    ctx.fillStyle = "#18181b40";
    ctx.fillRect(x, statsY, statWidth, statsHeight);

    // Label
    ctx.fillStyle = "#71717a";
    ctx.font = "12px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(stat.label, x + statWidth / 2, statsY + 35);

    // Value
    ctx.fillStyle = stat.color;
    ctx.font = "bold 36px Arial, sans-serif";
    ctx.fillText(stat.value, x + statWidth / 2, statsY + 75);
  });

  ctx.textAlign = "left";

  // Days grid section
  const gridY = statsY + statsHeight + 60;
  const gridHeight = HEIGHT - gridY - padding;

  // Group days by month
  const monthGroups: { month: string; year: string; days: DayData[] }[] = [];
  let currentMonth = "";

  for (const day of days) {
    const monthKey = day.date.substring(0, 7);
    if (monthKey !== currentMonth) {
      currentMonth = monthKey;
      const [year, month] = monthKey.split("-");
      monthGroups.push({ month, year, days: [] });
    }
    monthGroups[monthGroups.length - 1].days.push(day);
  }

  // Calculate grid dimensions - 3 rows x 4 columns
  const columns = 4;
  const rows = 3;
  const gapX = 40;
  const gapY = 30;
  const monthWidth = (contentWidth - (columns - 1) * gapX) / columns;
  const monthHeight = (gridHeight - (rows - 1) * gapY) / rows;

  monthGroups.forEach((group, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = padding + col * (monthWidth + gapX);
    const y = gridY + row * (monthHeight + gapY);

    // Month label
    ctx.fillStyle = "#71717a";
    ctx.font = "12px Arial, sans-serif";
    ctx.fillText(
      `${getMonthName(`${group.year}-${group.month}`)} ${group.year.slice(2)}`,
      x,
      y + 12
    );

    // Days grid (7 columns)
    const daySize = Math.min((monthWidth - 6 * 3) / 7, (monthHeight - 40) / 6);
    const dayGap = 3;

    group.days.forEach((day, dayIndex) => {
      const dayCol = dayIndex % 7;
      const dayRow = Math.floor(dayIndex / 7);
      const dayX = x + dayCol * (daySize + dayGap);
      const dayY = y + 25 + dayRow * (daySize + dayGap);

      // Determine color
      let color: string;
      if (!day.isPast && !day.isToday) {
        color = VOTE_COLORS.future;
      } else if (day.vote === "closer") {
        color = VOTE_COLORS.closer;
      } else if (day.vote === "further") {
        color = VOTE_COLORS.further;
      } else {
        color = VOTE_COLORS.pending;
      }

      ctx.fillStyle = color;
      ctx.fillRect(dayX, dayY, daySize, daySize);

      // Today indicator
      if (day.isToday) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.strokeRect(dayX, dayY, daySize, daySize);
      }
    });
  });

  // Generate PNG buffer
  const buffer = canvas.toBuffer("image/png");

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="dec31-dashboard-${new Date().toISOString().split("T")[0]}.png"`,
    },
  });
}
