"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Header,
  IdentityDisplay,
  VoteDialog,
  DaysView,
  MonthsView,
  BarView,
  GraphView,
  CompoundView,
  OverviewView,
} from "@/components/dashboard";
import {
  DayData,
  VoteType,
  getDaysInRange,
  START_DATE,
  END_DATE,
} from "@/lib/votes";

interface UserProfile {
  name: string;
  identity_statement: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [votes, setVotes] = useState<Map<string, VoteType>>(new Map());
  const [days, setDays] = useState<DayData[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Load profile
      const { data: profileData } = await supabase
        .from("users")
        .select("name, identity_statement")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile({
          name: profileData.name || "User",
          identity_statement: profileData.identity_statement || "",
        });
      }

      // Load votes
      const { data: votesData } = await supabase
        .from("votes")
        .select("date, vote")
        .eq("user_id", user.id);

      const votesMap = new Map<string, VoteType>();
      if (votesData) {
        for (const vote of votesData) {
          votesMap.set(vote.date, vote.vote as VoteType);
        }
      }
      setVotes(votesMap);

      // Calculate days
      const daysData = getDaysInRange(START_DATE, END_DATE, votesMap);
      setDays(daysData);

      setIsLoading(false);
    };

    loadData();
  }, [supabase, router]);

  const handleVote = async (date: string, vote: "closer" | "further") => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Upsert vote
    await supabase.from("votes").upsert(
      {
        user_id: user.id,
        date,
        vote,
      },
      {
        onConflict: "user_id,date",
      }
    );

    // Update local state
    const newVotes = new Map(votes);
    newVotes.set(date, vote);
    setVotes(newVotes);

    const newDays = getDaysInRange(START_DATE, END_DATE, newVotes);
    setDays(newDays);

    setSelectedDate(null);
  };

  const handleIdentityUpdate = async (newIdentity: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("users")
      .update({ identity_statement: newIdentity })
      .eq("id", user.id);

    setProfile((prev) =>
      prev ? { ...prev, identity_statement: newIdentity } : null
    );
  };

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-black dark:border-zinc-700 dark:border-t-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header name={profile.name} />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <IdentityDisplay
          identity={profile.identity_statement}
          onUpdate={handleIdentityUpdate}
        />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="days">Days</TabsTrigger>
            <TabsTrigger value="months">Months</TabsTrigger>
            <TabsTrigger value="bar">Bar</TabsTrigger>
            <TabsTrigger value="graph">Graph</TabsTrigger>
            <TabsTrigger value="compound">Score</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="overview">
              <OverviewView days={days} onDayClick={setSelectedDate} />
            </TabsContent>

            <TabsContent value="days">
              <DaysView days={days} onDayClick={setSelectedDate} />
            </TabsContent>

            <TabsContent value="months">
              <MonthsView days={days} />
            </TabsContent>

            <TabsContent value="bar">
              <BarView days={days} />
            </TabsContent>

            <TabsContent value="graph">
              <GraphView days={days} />
            </TabsContent>

            <TabsContent value="compound">
              <CompoundView days={days} />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      <VoteDialog
        date={selectedDate}
        onVote={handleVote}
        onClose={() => setSelectedDate(null)}
      />
    </div>
  );
}
