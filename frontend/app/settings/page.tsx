"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Australia/Sydney",
  "Pacific/Auckland",
];

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [timezone, setTimezone] = useState("America/New_York");
  const [notificationTime, setNotificationTime] = useState("21:00");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("timezone, notification_time")
        .eq("id", user.id)
        .single();

      if (profile) {
        if (profile.timezone) setTimezone(profile.timezone);
        if (profile.notification_time) {
          setNotificationTime(profile.notification_time.substring(0, 5));
        }
      }

      setIsLoading(false);
    }

    loadSettings();
  }, [supabase, router]);

  const handleSave = async () => {
    setIsSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("users")
        .update({
          timezone,
          notification_time: notificationTime + ":00",
        })
        .eq("id", user.id);
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-black dark:border-zinc-700 dark:border-t-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 -ml-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold text-black dark:text-white">
            Settings
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            Notifications
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Configure when you receive your daily vote reminder.
          </p>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Notification time</Label>
              <Input
                id="time"
                type="time"
                value={notificationTime}
                onChange={(e) => setNotificationTime(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                You will receive a daily email at this time to vote on your
                progress.
              </p>
            </div>
          </div>
        </section>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save settings"}
        </Button>
      </main>
    </div>
  );
}
