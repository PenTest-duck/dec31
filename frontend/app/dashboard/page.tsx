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

  const handleClearVote = async (date: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Delete vote
    await supabase.from("votes").delete().eq("user_id", user.id).eq("date", date);

    // Update local state
    const newVotes = new Map(votes);
    newVotes.delete(date);
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
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="h-4 w-4 animate-spin border border-zinc-700 border-t-white" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden">
      <Header name={profile.name} />

      <main className="flex-1 flex flex-col min-h-0 px-4 py-3">
        <IdentityDisplay
          identity={profile.identity_statement}
          onUpdate={handleIdentityUpdate}
        />

        <Tabs defaultValue="days" className="flex-1 flex flex-col min-h-0 mt-3">
          <TabsList className="grid w-full grid-cols-5 h-8 bg-zinc-900/50">
            <TabsTrigger value="days" className="text-xs h-7">Days</TabsTrigger>
            <TabsTrigger value="months" className="text-xs h-7">Months</TabsTrigger>
            <TabsTrigger value="bar" className="text-xs h-7">Bar</TabsTrigger>
            <TabsTrigger value="graph" className="text-xs h-7">Graph</TabsTrigger>
            <TabsTrigger value="overview" className="text-xs h-7">All</TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 mt-3 overflow-auto">
            <TabsContent value="days" className="mt-0 h-full">
              <DaysView days={days} onDayClick={setSelectedDate} />
            </TabsContent>

            <TabsContent value="months" className="mt-0 h-full">
              <MonthsView days={days} />
            </TabsContent>

            <TabsContent value="bar" className="mt-0 h-full">
              <BarView days={days} />
            </TabsContent>

            {/* <TabsContent value="graph" className="mt-0 h-full">
              <GraphView days={days} />
            </TabsContent> */}

            <TabsContent value="graph" className="mt-0 h-full">
              <CompoundView days={days} />
            </TabsContent>

            <TabsContent value="overview" className="mt-0 h-full">
              <OverviewView days={days} onDayClick={setSelectedDate} />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      <VoteDialog
        date={selectedDate}
        currentVote={selectedDate ? votes.get(selectedDate) : undefined}
        onVote={handleVote}
        onClear={handleClearVote}
        onClose={() => setSelectedDate(null)}
      />
    </div>
  );
}
