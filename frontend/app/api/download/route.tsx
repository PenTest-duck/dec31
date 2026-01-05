import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
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

function getDayColor(day: DayData): string {
  if (!day.isPast && !day.isToday) return VOTE_COLORS.future;
  if (day.vote === "closer") return VOTE_COLORS.closer;
  if (day.vote === "further") return VOTE_COLORS.further;
  return VOTE_COLORS.pending;
}

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

  const stats = [
    { label: "SCORE", value: currentScore.toFixed(1), color: "#ffffff" },
    { label: "CLOSER", value: closer.toString(), color: VOTE_COLORS.closer },
    { label: "FURTHER", value: further.toString(), color: VOTE_COLORS.further },
    { label: "PENDING", value: pending.toString(), color: VOTE_COLORS.pending },
    { label: "FUTURE", value: future.toString(), color: VOTE_COLORS.future },
  ];

  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#09090b",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", marginBottom: "40px" }}>
          <div style={{ display: "block", fontSize: "48px", fontWeight: "bold", color: "#ffffff" }}>
            dec31
          </div>
          {user.identity_statement && (
            <div
              style={{
                display: "block",
                fontSize: "20px",
                color: "#a1a1aa",
                marginTop: "12px",
                maxWidth: "90%",
                lineHeight: 1.4,
              }}
            >
              {user.identity_statement.length > 200
                ? user.identity_statement.substring(0, 200) + "..."
                : user.identity_statement}
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "40px" }}>
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                padding: "20px",
                border: "1px solid #27272a",
                backgroundColor: "#18181b",
                borderRadius: "8px",
              }}
            >
              <div style={{ display: "block", fontSize: "12px", color: "#71717a", marginBottom: "8px" }}>
                {stat.label}
              </div>
              <div style={{ display: "block", fontSize: "32px", fontWeight: "bold", color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Month Grid - 4 columns x 3 rows */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            flex: 1,
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "flex-start",
          }}
        >
          {monthGroups.map((group, index) => (
            <div
              key={`${group.year}-${group.month}`}
              style={{
                display: "flex",
                flexDirection: "column",
                width: "22%",
                marginRight: index % 4 === 3 ? 0 : "24px",
                alignItems: "flex-start",
                justifyContent: "flex-start",
              }}
            >
              {/* Month Label */}
              <div style={{ 
                display: "block",
                fontSize: "12px", 
                color: "#71717a", 
                marginBottom: "8px" 
              }}>
                {`${getMonthName(`${group.year}-${group.month}`)} ${group.year.slice(2)}`}
              </div>

              {/* Days Grid */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "3px",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                }}
              >
                {group.days.map((day) => (
                  <div
                    key={day.date}
                    style={{
                      display: "block",
                      width: "22px",
                      height: "22px",
                      backgroundColor: getDayColor(day),
                      border: day.isToday ? "2px solid #ffffff" : "none",
                      borderRadius: "2px",
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1920,
      height: 1080,
    }
  );

  // Get the response body as array buffer and return with download headers
  const buffer = await imageResponse.arrayBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="dec31-dashboard-${new Date().toISOString().split("T")[0]}.png"`,
    },
  });
}
